import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration (GCP Best Practices)
const GCP_PROJECT = process.env.GCP_PROJECT || 'gemini-enterprise-demo-502515';
const GCP_LOCATION = process.env.GCP_LOCATION || 'us-central1';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-pro'; // Default to 2.5 pro as requested
const DB_PATH = process.env.CYMBAL_DB_PATH || path.join(__dirname, 'cymbal.db');

console.error(`[INFO] Starting Agent...`);
console.error(`[INFO] GCP Project: ${GCP_PROJECT}`);
console.error(`[INFO] GCP Location: ${GCP_LOCATION}`);
console.error(`[INFO] Model: ${GEMINI_MODEL}`);

// Initialize Gemini Client (uses Vertex AI if project is set)
const ai = new GoogleGenAI({
  vertexai: true,
  project: GCP_PROJECT,
  location: GCP_LOCATION,
});

// Initialize MCP Client
const mcpClient = new Client(
  {
    name: "cymbal-catering-agent-client",
    version: "1.0.0",
  },
  {
    capabilities: {},
  }
);

let mcpTools = [];

async function startMcpConnection() {
  console.error(`[INFO] Connecting to MCP Server...`);
  const transport = new StdioClientTransport({
    command: "node",
    args: [path.join(__dirname, "mcp-server-cymbal.js")],
    env: {
      ...process.env,
      CYMBAL_DB_PATH: DB_PATH // Pass DB path to server
    }
  });

  await mcpClient.connect(transport);
  console.error(`[INFO] Connected to MCP Server.`);

  // List available tools
  const response = await mcpClient.listTools();
  mcpTools = response.tools;
  console.error(`[INFO] Discovered ${mcpTools.length} tools from MCP Server.`);
}

// Helper to convert MCP tools to Gemini format
function getGeminiTools() {
  const declarations = mcpTools.map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.inputSchema
  }));

  return [{
    functionDeclarations: declarations
  }];
}

// Global conversation history to maintain context between turns
const history = [];

// Helper to call Gemini with exponential backoff retry for 429s (GCP Best Practice)
async function callGeminiWithRetry(params, maxRetries = 5, delay = 2000) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await ai.models.generateContent(params);
    } catch (error) {
      attempt++;
      // Check for 429 Rate Limit error
      if (error.status === 429 && attempt < maxRetries) {
        console.error(`[WARN] Vertex AI 429 (Resource Exhausted). Retrying attempt ${attempt}/${maxRetries} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw error;
      }
    }
  }
}

// Agent conversation loop
async function runAgent(userPrompt) {
  history.push({
    role: 'user',
    parts: [{ text: userPrompt }]
  });

  console.log(`\n[Agent]: Processing request...`);

  let loopCount = 0;
  const maxLoops = 10; // Safety limit

  while (loopCount < maxLoops) {
    loopCount++;
    
    // Call Gemini with retry handling
    const response = await callGeminiWithRetry({
      model: GEMINI_MODEL,
      contents: history,
      config: {
        systemInstruction: `You are the Cymbal Catering Assistant, an AI agent that manages clients and catering orders.
Today's date is ${new Date().toISOString().split('T')[0]}.

You have access to tools to query clients, add clients, query the menu catalog, query orders, and create orders.
Always use these tools to perform actions and lookup information.

Guidelines:
1. **Tool Usage**:
   - Before answering queries about clients or orders, use the appropriate query tools.
   - When asked to create an order, first verify if the client exists using 'query_clients'. If not found, ask for details or add them.
   - Check the menu catalog using 'query_menu_catalog' to find the exact menu items the user wants, and match them to their IDs. Do NOT assume item names or prices; only use what is returned by the tool.
   - Once you have all required information (client ID, event name, date, time, guest count, and items with quantities), call 'create_catering_order' to save it to the database.
2. **Date Handling**:
   - Today's year is ${new Date().getFullYear()}. Interpret relative dates (like "August 20") relative to today's date.
   - Always format dates as YYYY-MM-DD when passing to tools.
3. **Accuracy**:
   - Do NOT hallucinate menu items or prices. If a category is empty or does not contain what the user wants, inform them of the available options.
   - Once the user confirms they want to proceed with creating an order, immediately call the 'create_catering_order' tool. Do not ask "How can I help you?" after they say "Yes" to a confirmation.
4. **Tone**: Be professional, concise, and helpful.`,
        tools: getGeminiTools(),
      }
    });

    const candidate = response.candidates?.[0];
    if (!candidate) {
      throw new Error("No response candidate from Gemini");
    }

    const parts = candidate.content.parts;
    
    // Add model's response to history
    history.push({
      role: 'model',
      parts: parts
    });

    // Check for function calls
    const functionCalls = response.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      const toolResults = [];

      for (const call of functionCalls) {
        const { name, args } = call;
        console.error(`[INFO] Agent executing tool: ${name} with args: ${JSON.stringify(args)}`);
        
        try {
          // Call the MCP tool
          const mcpResult = await mcpClient.callTool({
            name,
            arguments: args
          });

          // Convert MCP content to string for Gemini
          const textResult = mcpResult.content.map(c => c.text).join('\n');
          
          toolResults.push({
            functionResponse: {
              name,
              response: { result: textResult }
            }
          });
        } catch (toolError) {
          console.error(`[ERROR] Tool execution failed: ${name}`, toolError);
          toolResults.push({
            functionResponse: {
              name,
              response: { error: toolError.message }
            }
          });
        }
      }

      // Add tool responses to history
      history.push({
        role: 'user',
        parts: toolResults.map(r => ({ functionResponse: r.functionResponse }))
      });

      // Continue the loop to let the model process the tool results
      continue;
    }

    // If no function calls, we are done
    const textResponse = response.text;
    console.log(`\n[Agent]: ${textResponse}`);
    break;
  }

  if (loopCount >= maxLoops) {
    console.log(`\n[Agent]: Reached maximum execution steps. Stopping.`);
  }
}

// CLI Interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  try {
    await startMcpConnection();
    
    console.log('\n==================================================');
    console.log('Cymbal Catering Agent CLI is ready.');
    console.log('Ask me to list clients, add a client, query menu, or create an order.');
    console.log('Type "exit" to quit.');
    console.log('==================================================\n');

    const promptUser = () => {
      rl.question('\nYou: ', async (input) => {
        if (input.toLowerCase() === 'exit') {
          rl.close();
          return;
        }

        if (input.trim()) {
          try {
            await runAgent(input);
          } catch (e) {
            console.error(`[ERROR] Agent failed to process request:`, e);
          }
        }
        promptUser();
      });
    };

    promptUser();

  } catch (error) {
    console.error("[FATAL] Initialization failed:", error);
    process.exit(1);
  }
}

// Clean shutdown
rl.on('close', async () => {
  console.error('[INFO] Shutting down connection...');
  try {
    await mcpClient.close();
  } catch (e) {
    // Ignore
  }
  console.log('Goodbye!');
  process.exit(0);
});

main();
