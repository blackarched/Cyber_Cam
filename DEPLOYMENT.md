# Nexus Security Grid - Deployment Guide

This guide provides instructions on how to deploy the Nexus Security Grid to a production environment.

## 1. Prerequisites

Before you begin, you will need the following:

- A server with Docker and Docker Compose installed.
- A registered domain name.
- A PostgreSQL database.
- A Redis server.
- A HashiCorp Vault server.

## 2. Configuration

1. Clone the repository to your server.
2. Create a `.env` file in the root of the project and add the following environment variables:

```
# Server Configuration
PORT=8443
NODE_ENV=production
FRONTEND_ORIGIN=https://your-domain.com

# JSON Web Token Secret
JWT_SECRET=your-jwt-secret

# Database Connection Details
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name

# Redis Connection Details
REDIS_HOST=your-redis-host
REDIS_PORT=6379

# Vault Configuration
VAULT_ENDPOINT=your-vault-endpoint
VAULT_TOKEN=your-vault-token

# Security Configuration
BLOCKED_IPS=
```

3. Replace the placeholder values with your actual values.

## 3. Deployment

1. Build the Docker images:

```
docker-compose build
```

2. Start the Docker containers:

```
docker-compose up -d
```

3. The application should now be running on port 8443.

## 4. Nginx Configuration

It is recommended to use a reverse proxy, such as Nginx, to expose the application to the internet. Here is an example Nginx configuration:

```
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/your/certificate.pem;
    ssl_certificate_key /path/to/your/key.pem;

    location / {
        proxy_pass http://localhost:8443;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 5. Troubleshooting

If you encounter any issues during the deployment, please refer to the `RUNBOOK.md` file for troubleshooting tips.
