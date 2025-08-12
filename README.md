# NEXUS SECURITY GRID

An advanced, production-ready surveillance system with a focus on security, performance, and real-time data processing.

---

## 🚨 CRITICAL SECURITY WARNING 🚨

**DO NOT deploy this system to a staging or production environment with the default secrets.**

[cite_start]The `.env.example` file contains placeholder values for sensitive information like the `JWT_SECRET`.  Before running the application in any non-local environment, you **must** generate new, cryptographically secure secrets.

---

## Prerequisites

- **Node.js** (v18 or later)
- **Docker** and **Docker Compose**
- **OpenSSL** (for generating local certificates)

---

## 🚀 Local Development Setup

Follow these steps to get the NEXUS grid operational on your local machine.

### 1. Clone the Repository

```bash
git clone <repository_url>
cd nexus-security-grid
2. Configure Environment Secrets
The system uses an .env file for all configuration and secrets. This file is ignored by Git and should never be committed.

Copy the example file:

Bash

cp .env.example .env

Generate a new JWT Secret: The default secret is insecure.  Run the following command and replace the 

JWT_SECRET value in your new .env file with the output.

Bash

npm run generate:secret

Review other variables: Adjust database passwords or other settings in .env as needed. 

3. Generate SSL Certificates
The NGINX proxy requires SSL certificates to handle HTTPS traffic. The docker-compose.yml file expects them in a ./certs directory.

Run the generation script: This command uses OpenSSL to create a self-signed certificate and key for localhost.

Bash

npm run generate:certs
4. Build and Launch the Grid
With configuration complete, use Docker Compose to build the images and launch all system services.

Launch all services in the background:

Bash

docker-compose up --build -d
Verify services are running:

Bash

docker-compose ps
You should see nexus-proxy, nexus-server, and nexus-db running.

The NEXUS API is now accessible at https://localhost.

Available npm Scripts
npm start: Starts the Node.js server directly.

npm run dev: Starts the server with nodemon for automatic restarts on file changes.

npm run test: Runs the Jest test suite.

npm run lint: Lints the code with ESLint.

npm run generate:certs: Creates self-signed SSL certificates for local development.

npm run generate:secret: Generates a new secure string for the JWT_SECRET.

System Services
The docker-compose.yml orchestrates the following services:

nginx: A secure NGINX reverse proxy that handles incoming traffic, terminates SSL, and forwards requests to the application server.

nexus-server: The core Node.js application server running the Express API.

nexus-db: The PostgreSQL database for storing all system data.