# 🧁 Cymbal Catering: Enterprise MCP Server & Agent Platform Integration on Google Cloud

[![GCP Product](https://img.shields.io/badge/Google_Cloud-Vertex_AI-4285F4?logo=google-cloud&logoColor=white)](https://cloud.google.com/vertex-ai)
[![MCP Protocol](https://img.shields.io/badge/Protocol-Model_Context_Protocol-orange?logo=json)](https://modelcontextprotocol.io/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

This repository contains the complete production-grade source code and architectural blueprints for deploying a secure, database-connected **Model Context Protocol (MCP)** server and web application on Google Cloud. 

The project demonstrates how to connect private enterprise databases (running on **Cloud SQL PostgreSQL** behind a private IP) to Google Cloud's **Vertex AI Reasoning Engine** (Agent SDK) using the modern, session-aware **Streamable HTTP transport** protocol.

> [!NOTE]
> **Cymbal Bakery & Cymbal Catering** are fictional demo companies used across Google Cloud documentation to illustrate architectural patterns and cloud-native solutions.

---

## 📖 Table of Contents
*   [Architecture Design](#-architecture-design)
*   [Business Motivation & Goals](#-business-motivation--goals)
*   [Key Components Built](#-key-components-built)
*   [Infrastructure Requirements](#-infrastructure-requirements)
*   [Step-by-Step Deployment Guide](#-step-by-step-deployment-guide)


    *   [Step 1: Network & Private Database Setup](#step-1-network--private-database-setup)
    *   [Step 2: Service Accounts & IAM Roles](#step-2-service-accounts--iam-roles)
    *   [Step 3: Docker & Cloud Build Registry Setup](#step-3-docker--cloud-build-registry-setup)
    *   [Step 4: Deploying the Services to Cloud Run](#step-4-deploying-the-services-to-cloud-run)
*   [Handshake & Verification Guide](#-handshake--verification-guide)
*   [Optional: Security Bypass & Public Ingress](#-optional-security-bypass--public-ingress-for-demo--console-integration)
*   [Registering your MCP Server in the Agent Registry](#-registering-your-mcp-server-in-the-google-cloud-agent-registry)
*   [Connecting to Gemini Enterprise as a Data Store](#-connecting-your-mcp-server-to-gemini-enterprise-as-a-data-store)
*   [Presenting the Live Demo (End-to-End Walkthrough)](#-presenting-the-live-demo-end-to-end-walkthrough)
*   [GCP Production Best Practices Implemented](#-gcp-production-best-practices-implemented)

---

## 📐 Architecture Overview

The system is designed with a secure, decoupled layout that connects user-facing applications and conversational AI interfaces to a private transactional database:

1.  **Gemini Enterprise App (AI Chat Interface)**: The primary conversational portal for users. When a user asks questions or makes requests (e.g., *"Book an event for Robert"*), Gemini Enterprise translates these intents into API tool invocations and routes them directly to the registered MCP Server.
2.  **Catering Dashboard (Web UI)**: A React web dashboard and Express backend API deployed on **Cloud Run** (`cymbal-webapp`) that displays CRM client profiles, calendars, and catering orders in real time.
3.  **Cymbal MCP Server**: An Express server deployed on **Cloud Run** (`cymbal-mcp`) utilizing the Model Context Protocol (Streamable HTTP Transport). It acts as a secure API gateway, transforming database CRUD actions into structured tools that the Gemini LLM can discover and call.
4.  **Private Database (Cloud SQL PostgreSQL)**: Hosted inside a custom **Cymbal VPC network** with no public IP address. It is peered using **Private Services Access**, guaranteeing that only the authorized Web App and MCP Server can query or modify the tables.

---

## 🎯 Business Motivation & Goals

In enterprise environments, generative AI models need safe, authenticated access to proprietary data systems (e.g. CRM, Inventory, ERP) to be useful. However, databases containing client details and financial transactions should never be exposed to the public internet.

This blueprint demonstrates how to:
1.  **Enforce Private Database Access**: Configure PostgreSQL to use Private Service Access (no public IP) within a custom VPC network.
2.  **Enable Agentic Tool Invocations**: Expose database operations (CRUD) to Large Language Models using the **Model Context Protocol (MCP)**.
3.  **Deploy Session-Aware Services Serverlessly**: Handle the stateful, session-based requirements of the Streamable HTTP transport (the standard for MCP over webhooks) inside stateless **Cloud Run** containers.
4.  **Enforce IAM Security Policies**: Bind distinct Service Accounts to the webapp and the tool-calling server, restricting database query permissions strictly to authorized identities.

---

## 📦 Key Components Built

1.  **Catering Dashboard (Frontend)**: A React/Vite web application that displays real-time CRM customer profiles, booking calendars, supplier statuses, and menu catalog packages.
    
<img width="1261" height="643" alt="Screenshot 2026-08-12 at 2 11 27 PM" src="https://github.com/user-attachments/assets/b170c061-fefd-4fb0-bc91-d8dd5d30c371" />
    
2.  **Business API Server (Backend)**: An Express server ([`server.js`](server.js)) serving REST endpoints for standard web UI database transactions.
3.  **HTTP MCP Server**: An Express server ([`mcp-server-cymbal.js`](mcp-server-cymbal.js)) that implements the **Model Context Protocol Streamable HTTP Transport**, transforming standard SQL queries into structured tools that an LLM can list and execute.
4.  **Casing Translation Layer**: A database access module ([`db.js`](db.js)) that translates PostgreSQL's default lowercase column formats (e.g. `deliveryaddress`) to the camelCase keys (e.g. `deliveryAddress`) required by the TypeScript frontend.

---

## 🛠️ Infrastructure Requirements

Before deploying the code, you must ensure the following APIs are enabled in your target GCP project:
*   `compute.googleapis.com` (VPC Networks)
*   `servicenetworking.googleapis.com` (Private Services Access Peering)
*   `sqladmin.googleapis.com` (Cloud SQL Admin API)
*   `run.googleapis.com` (Cloud Run)
*   `cloudbuild.googleapis.com` (Cloud Build)
*   `artifactregistry.googleapis.com` (Container Image Registry)

## 🚀 Step-by-Step Deployment Guide

> [!IMPORTANT]
> **Environment Parameters Warning**: 
> The commands and configurations in this guide contain placeholder values (e.g. Project ID `<PROJECT_ID>`, Database Host IP `<DB_PRIVATE_IP>`, and MCP Service URL `https://<MCP_SERVICE_URL>`). 
> **You must replace these placeholders** with your own target project ID, SQL Private IP, and Cloud Run service URLs when deploying this codebase to your own GCP environment.

### Getting Started in Google Cloud Shell

1. **Open Google Cloud Shell** in your Google Cloud Console.
2. **Clone this repository** to download the deployment configurations and codebase:
   ```bash
   git clone https://github.com/gabbarbosateixeira/cymbal-catering-mcp.git
   cd cymbal-catering-mcp
   ```
3. **Initialize Environment Variables**:
   Fetch your active Project ID and define a secure password for your PostgreSQL database. Run these commands to store them in your shell session:
   ```bash
   PROJECT_ID=$(gcloud config get-value project)
   DB_PASSWORD="your-secure-password" # REPLACE with your own database password

   echo "Project ID set to: $PROJECT_ID"
   ```

Follow these sequential steps in your terminal to deploy the complete architecture.



### Step 1: Network & Private Database Setup

We establish a custom VPC network and peer it with Google Services so our Cloud SQL instance can be reached privately.

```bash
# 1. Create the VPC network
gcloud compute networks create cymbal-vpc --subnet-mode=custom

# 2. Allocate an IP range for Private Services Connection (PSA)
gcloud compute addresses create cymbal-psa-range \
    --global \
    --purpose=VPC_PEERING \
    --addresses=192.168.0.0 \
    --prefix-length=16 \
    --network=cymbal-vpc

# 3. Create the peering connection to Google services
gcloud services vpc-peerings connect \
    --service=servicenetworking.googleapis.com \
    --ranges=cymbal-psa-range \
    --network=cymbal-vpc

# 4. Create the Private Cloud SQL PostgreSQL Instance
gcloud sql instances create cymbal-pg \
    --database-version=POSTGRES_15 \
    --cpu=1 \
    --memory=3840Mi \
    --network=cymbal-vpc \
    --no-assign-ip \
    --region=us-central1 \
    --root-password="$DB_PASSWORD"

# 5. Initialize the database and default postgres user
gcloud sql databases create cymbal --instance=cymbal-pg

# 6. Retrieve and save the Private IP address of the database
DB_PRIVATE_IP=$(gcloud sql instances describe cymbal-pg --format="value(ipAddresses.ipAddress)")
echo "DB_PRIVATE_IP set to: $DB_PRIVATE_IP"
```


---

### Step 2: Service Accounts & IAM Roles

We create distinct service accounts for the Web Application and the MCP Server to implement the principle of least privilege.

```bash
# 1. Create the Service Account for the Web Application
gcloud iam service-accounts create cymbal-webapp-sa \
    --display-name="Cymbal WebApp Service Account"

# 2. Create the Service Account for the MCP Server
gcloud iam service-accounts create cymbal-mcp-sa \
    --display-name="Cymbal MCP Service Account"

# 3. Grant both Service Accounts database access permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:cymbal-webapp-sa@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:cymbal-mcp-sa@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"

```

---

### Step 3: Docker & Cloud Build Registry Setup

Create the Artifact Registry repository and use Cloud Build to build and push the container images directly from your workspace:

```bash
# 1. Create the Docker repository in us-central1
gcloud artifacts repositories create cymbal-repo \
    --repository-format=docker \
    --location=us-central1 \
    --description="Docker repository for Cymbal Catering App"

# 2. Build and push the MCP Server Container
gcloud builds submit --config=cloudbuild-mcp.yaml .

# 3. Build and push the Web App Container
gcloud builds submit --config=cloudbuild-webapp.yaml .
```

---

### Step 4: Deploying the Services to Cloud Run

We deploy both applications. The MCP Server deployment is strictly scaled to a **maximum of 1 instance** to enforce in-memory session consistency required by the MCP Streamable HTTP transport:

```bash
# 1. Deploy the MCP Server (Authenticated, Private Egress, Scaled to 1 instance)
gcloud run deploy cymbal-mcp \
    --image=us-central1-docker.pkg.dev/$PROJECT_ID/cymbal-repo/mcp-server:latest \
    --region=us-central1 \
    --no-allow-unauthenticated \
    --max-instances=1 \
    --network=cymbal-vpc \
    --subnet=cymbal-vpc \
    --set-env-vars=DB_HOST=$DB_PRIVATE_IP,DB_USER=postgres,DB_PASSWORD=$DB_PASSWORD,DB_NAME=cymbal

# 2. Deploy the Web App (Allows public traffic, Private Egress to SQL)
gcloud run deploy cymbal-webapp \
    --image=us-central1-docker.pkg.dev/$PROJECT_ID/cymbal-repo/webapp:latest \
    --region=us-central1 \
    --allow-unauthenticated \
    --network=cymbal-vpc \
    --subnet=cymbal-vpc \
    --set-env-vars=DB_HOST=$DB_PRIVATE_IP,DB_USER=postgres,DB_PASSWORD=$DB_PASSWORD,DB_NAME=cymbal

```

---

## 🔍 Handshake & Verification Guide

To verify that your services are running correctly and communicating with your Cloud SQL database, follow these testing procedures.

### 1. Preview the Web Application Dashboard

Because the web application is restricted to domain members, you must proxy its traffic through Cloud Shell to access the frontend:

```bash
# Start the Web App proxy on port 8081
gcloud run services proxy cymbal-webapp --region us-central1 --port 8081
```

*   **Access the App**: Click the **Web Preview** button in the top-right corner of Google Cloud Shell, select **Preview on port 8081**, and the catering application will load. If you see an error about the port being already utilized, restart cloud shell.

---

### 2. Test the MCP Server (Direct Method - Public Ingress)

Since we deployed the MCP server with public ingress allowed (`--ingress=all`), you can call the API directly using your authenticated Google identity token without a local proxy:

#### A. Initialize the session and get a Session ID
```bash
# Get the MCP Server Service URL from Cloud Run
MCP_SERVICE_URL=$(gcloud run services describe cymbal-mcp --region=us-central1 --format="value(status.url)")

TOKEN=$(gcloud auth print-identity-token)
curl -i -X POST $MCP_SERVICE_URL/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-11-25",
      "capabilities": {},
      "clientInfo": {"name": "registry-fetch", "version": "1.0.0"}
    },
    "id": 1
  }'
```
*   **Success Indicator**: Look for `Mcp-Session-Id: <UUID>` in the response headers.

#### B. Call the `add_client` Tool using the Session ID
Replace `<SESSION_ID>` with the UUID from the headers:
```bash
curl -X POST $MCP_SERVICE_URL/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: <SESSION_ID>" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "add_client",
      "arguments": {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "company": "Acme Corp",
        "segment": "Corporate Tech"
      }
    },
    "id": 2
  }'
```


---

### 3. Test the MCP Server (Tunnel Method - Internal Ingress)

If you restore the strict `internal` ingress setting in production, direct URLs will return a `404`. You must use a local proxy tunnel instead:

1.  **Start the proxy tunnel**:
    ```bash
    gcloud run services proxy cymbal-mcp --region us-central1
    ```
2.  **Run the handshake via localhost** (Open a new terminal tab):
    ```bash
    curl -i -X POST http://localhost:8080/mcp \
      -H "Content-Type: application/json" \
      -H "Accept: application/json, text/event-stream" \
      -d '{
        "jsonrpc": "2.0",
        "method": "initialize",
        "params": {
          "protocolVersion": "2025-11-25",
          "capabilities": {},
          "clientInfo": {"name": "test-client", "version": "1.0.0"}
        },
        "id": 1
      }'
    ```
3.  Use the returned `Mcp-Session-Id` header to execute tool calls targeting `http://localhost:8080/mcp`.

---

## 🛡️ Optional: Security Bypass & Public Ingress (For Demo / Console Integration)

In enterprise and sandbox environments (like Argolis), the **Domain Restricted Sharing (DRS)** Organization Policy (`constraints/iam.allowedPolicyMemberDomains`) prevents adding non-domain principals (like `allUsers`) to IAM policies.

To enable a frictionless integration with Gemini Enterprise (which requires unauthenticated access for third-party discovery during demos), you can temporarily override this policy at the project level and allow public invoker access.

### 🟢 Disable Domain Restriction (Pre-Demo Setup)
Execute these commands in Cloud Shell to temporarily allow external access and authorize the public endpoint:

```bash
# A. Break policy inheritance and allow all domains at the project level
gcloud resource-manager org-policies set-policy /dev/stdin --project=gemini-enterprise-demo-502515 <<EOF
constraint: constraints/iam.allowedPolicyMemberDomains
listPolicy:
  allValues: ALLOW
  inheritFromParent: false
EOF

# B. Grant unauthenticated invoker permissions to your Cloud Run service
gcloud run services add-iam-policy-binding cymbal-mcp \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/run.invoker"

```


### 🔴 Enable Domain Restriction (Post-Demo Cleanup)
Once your presentations are complete, execute these commands to restore the strict parent domain policies and block public access:

```bash
# A. Revoke unauthenticated public access from the Cloud Run service
gcloud run services remove-iam-policy-binding cymbal-mcp \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/run.invoker"

# B. Delete the project-level Org Policy override to restore strict inheritance
gcloud resource-manager org-policies delete constraints/iam.allowedPolicyMemberDomains --project=$PROJECT_ID

```

---

## 🤖 Registering your MCP Server in the Google Cloud Agent Registry

Google Cloud uses a centralized **Agent Registry** to catalog corporate API resources. Registering your MCP server exposes the tool specifications to your project's developers and agents securely.

| Feature | How the Registry Solves It | Why It Matters |
| :--- | :--- | :--- |
| **Zero-Zero Security** | You manually paste the JSON tool specification to tell the Registry what tools exist. | Your live production server never has to be exposed to the public internet or made unauthenticated just for schema discovery. |
| **Enterprise Reusability** | Once registered in your project's directory, any agent, playbook, or developer can reuse these exact tools. | Eliminates developer silos. You build your CRM or catering APIs once, and they are instantly available to everyone. |
| **Client-Side Validation** | Gemini loads and caches your JSON schema in memory to validate arguments before calling your backend. | Prevents database injection, saves compute cycles, and keeps invalid payloads from hitting your Cloud Run container. |

### Step 1: Locate your MCP Server URL
You can view your deployed MCP URL in the Cloud Run Console, or resolve it programmatically in Cloud Shell:
```bash
MCP_SERVICE_URL=$(gcloud run services describe cymbal-mcp --region=us-central1 --format="value(status.url)")
echo "MCP Server URL: $MCP_SERVICE_URL/mcp"
```

### Step 2: Retrieve the Tool Specification JSON
Because your service is protected by IAM, you can use your active developer identity to pull the schema locally and copy it:

1.  **Initialize the Stateful Session** to get the session ID:
    ```bash
    TOKEN=$(gcloud auth print-identity-token)
    curl -i -X POST $MCP_SERVICE_URL/mcp \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -H "Accept: application/json, text/event-stream" \
      -d '{
        "jsonrpc": "2.0",
        "method": "initialize",
        "params": {
          "protocolVersion": "2025-11-25",
          "capabilities": {},
          "clientInfo": {"name": "registry-fetch", "version": "1.0.0"}
        },
        "id": 1
      }'
    ```
    *Copy the returned `mcp-session-id` UUID header.*

2.  **Fetch and Format the Tools List**:
    Replace `SESSION_ID` with your copied UUID:
    ```bash
    TOKEN=$(gcloud auth print-identity-token)
    curl -s -X POST $MCP_SERVICE_URL/mcp \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -H "Accept: application/json, text/event-stream" \
      -H "mcp-session-id: SESSION_ID" \
      -d '{
        "jsonrpc": "2.0",
        "method": "tools/list",
        "params": {},
        "id": 2
      }' | grep -o 'data: .*' | sed 's/data: //' | jq '.result | {tools: .tools}'
    ```
    *Copy the complete JSON output (starting with `{` and ending with `}`) to your clipboard.*


### Step 3: Register in the Google Cloud Console
1.  Go to **APIs & Services** > **Agent Registry** > **Add MCP Server** in your console.
2.  Fill out the fields:
    *   **Name**: `cymbal-mcp`
    *   **Description**: `Cymbal Catering CRM and Ordering tools.`
    *   **Region**: `us-central1`
    *   **MCP server URL**: `https://<MCP_SERVICE_URL>/mcp`
    *   **Tool specification (JSON)**: Paste the JSON schema copied from Step 2.
3.  Click **Save / Register**. Your 7 tools will instantly import and display inside the Registry!

---

## 🧠 Connecting Your MCP Server to Gemini Enterprise as a Data Store

A Data Store in Gemini Enterprise serves as a dynamic, semantic portal connecting your generative AI app to your transaction systems (CRM, catering menu, and order booking databases).

### Key Benefits of This Integration:
*   **Conversational CRM**: Gemini translates human intentions directly into database actions. Users can query, add, or update client data simply by talking to the agent (e.g. *"Change Jane Doe to a Regular Client"*).
*   **Grounded Reasoning with Dynamic Catalogs**: Gemini can search live products, prices, and suppliers instantly to answer customer questions with 100% accurate, up-to-date data.
*   **Secure, Server-Side Business Rules**: The MCP server acts as an API gateway. It ensures that any action Gemini takes (like creating a catering order) strictly adheres to your backend validation and pricing calculations.

### Step 1: Configure the "Create Data Store" Wizard
1.  Navigate to **Gemini Enterprise** > **Data stores** > **Create data store** > **MCP Server Configuration**.
2.  Set the configuration:
    *   **Authentication Settings**: Select **No authentication** (made possible because you set your Cloud Run service to allow public, unauthenticated invocations during the pre-demo setup).
    *   **MCP Server URL**: `https://<MCP_SERVICE_URL>/mcp`
3.  Click **Continue**.

### Step 2: Configure Prompts & NLP Instructions
Supply the following behavioral instructions on the options screen so the Gemini LLM knows precisely when and how to route requests to your database:

*   **MCP Server Description**:
    ```text
    This server provides direct access to the Cymbal Catering CRM and event order system. It contains tools to query, add, and update client profiles, search the corporate catering menu catalog, and manage (create/update/query) event catering orders.
    ```
*   **MCP Agent Instructions**:
    ```text
    Always use these tools when the user asks questions about catering clients, orders, menu options, or event coordination. 
    - When asked to find a customer or filter customers, use query_clients.
    - When asked to add a new customer, gather their name and email first, then use add_client.
    - Before creating an order, query the client's ID and search the menu catalog using query_menu_catalog to verify items.
    - To place an order, use create_catering_order and supply the customerId, event details, guest count, and items.
    - For existing orders, use query_orders or update_catering_order as requested.
    ```
4.  Choose a name and region for the data store and click **Save**. Your MCP is now connected to Gemini Enterprise!

---

## 🎭 Presenting the Live Demo (End-to-End Walkthrough)

To demonstrate the power of the Model Context Protocol (MCP) and its integration with Gemini Enterprise, follow this end-to-end presentation script to showcase real-time data synchronization between the AI agent and the web application dashboard:

### 1. Start the Web App Dashboard
Before demoing, ensure the frontend dashboard is running and accessible:
```bash
# Start the web app proxy in Cloud Shell
gcloud run services proxy cymbal-webapp --region us-central1 --port 8081
```
*   **Access the UI**: Click **Web Preview** > **Preview on port 8081** in Cloud Shell to open the dashboard in a browser tab. Keep this tab open next to your Gemini Enterprise Console.

### 2. Verify Security Bypass is Active
Gemini Enterprise must have public access to your `cymbal-mcp` service to discover and invoke the tools. Verify you have executed the **Disable Domain Restriction** commands in the pre-demo setup section, allowing unauthenticated traffic to the server.

### Quick Demonstration

Creating a new order using the MCP actions
<img width="1250" height="647" alt="Screen Recording 2026-08-12 at 2 57 34 PM" src="https://github.com/user-attachments/assets/516282af-3c38-46c3-91df-ddf4074fed17" />

Result in the app
<img width="1250" height="647" alt="Screenshot 2026-08-12 at 2 59 16 PM" src="https://github.com/user-attachments/assets/129137ea-8296-4e13-afa3-717d1a356b5e" />


### 3. Run the Presentation Script (Conversational CRM & Ordering)

Open your Gemini Enterprise App chat window and perform the following sequence:

1.  **Ask to check client base**:
    *   *Prompt*: "Who are our clients in the Small Business segment?"
    *   *AI Action*: Gemini will invoke `query_clients(segment="Small Business")` and list your customers (including John Doe if you created him earlier).
2.  **Add a new client**:
    *   *Prompt*: "Add a new client named 'Robert Johnson' with email 'robert@gamma.com' from company 'Gamma Labs'. He is in the 'Small Business' segment."
    *   *AI Action*: Gemini will invoke `add_client` and confirm the profile is created.
    *   *UI Sync*: Go to your **Catering Dashboard** tab, refresh the page, and select the **CRM** tab. You will see **Robert Johnson** immediately appears in the list!
3.  **Search the Menu**:
    *   *Prompt*: "What menu packages do we have for birthdays?"
    *   *AI Action*: Gemini will invoke `query_menu_catalog(category="Birthday")` and explain the Birthday Celebration Package pricing and servings.
4.  **Book an Event Order**:
    *   *Prompt*: "Book a Birthday Celebration Package (menu-1) for Robert Johnson. The event is 'Gamma Launch Party' on September 15th, 2026 at 06:00 PM for 30 guests. Set it up in the lobby."
    *   *AI Action*: Gemini will resolve Robert's customer ID (`cust-...`), translate the menu request, and call `create_catering_order`. It will output the final invoice, including tax and delivery fee calculations.
    *   *UI Sync*: Switch to your **Catering Dashboard** tab, refresh the page, and select the **Catering Orders** tab. The new **Gamma Launch Party** order will be displayed live with its calculated totals.

### 4. Cleanup
Once the presentation is finished, remember to execute the **Enable Domain Restriction (Post-Demo Cleanup)** commands to lock down your services and restore default project-level security policies.

---

## 🛡️ GCP Production Best Practices Implemented

*   **VPC Peering Isolation**: No public database ports are exposed. The Cloud Run containers use private VPC connectors to query the database.
*   **Stateless Scaling Constraints**: The MCP server is limited to `--max-instances=1` to guarantee session persistence for HTTP stream connections. In production, this can be substituted by custom middleware routing sessions to a centralized Memorystore (Redis) instance.
*   **Container Build Best Practices**: Multi-stage dockerfiles compile production frontend bundles and exclude developmental packages (like DevDependencies and Vite tools) in the final run-time image.
*   **Least Privilege Access**: Separate IAM service accounts limit DB client permissions strictly to the cloud resources that need access.
