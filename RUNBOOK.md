# Nexus Security Grid - Runbook

This runbook provides troubleshooting tips for common issues that may arise when running the Nexus Security Grid.

## 1. Common Issues

### 1.1. Application Fails to Start

If the application fails to start, check the following:

- **Environment Variables**: Ensure that all the required environment variables are set in the `.env` file.
- **Database Connection**: Ensure that the database is running and that the connection details in the `.env` file are correct.
- **Redis Connection**: Ensure that Redis is running and that the connection details in the `.env` file are correct.
- **Vault Connection**: Ensure that Vault is running and that the connection details in the `.env` file are correct.
- **Docker**: Ensure that Docker and Docker Compose are installed and running.

### 1.2. 502 Bad Gateway Error

If you encounter a 502 Bad Gateway error, it is likely that the backend server is not running. Check the logs for the `nexus-security-grid` container to see if there are any errors.

```
docker-compose logs -f nexus-security-grid
```

### 1.3. WebSocket Connection Fails

If the WebSocket connection fails, check the following:

- **Nginx Configuration**: Ensure that the Nginx configuration is correct and that it is configured to proxy WebSocket connections.
- **CORS**: Ensure that the `FRONTEND_ORIGIN` environment variable is set to the correct value.

### 1.4. Motion Detection Not Working

If motion detection is not working, check the following:

- **Redis**: Ensure that Redis is running and that the motion detection microservice is able to connect to it.
- **Motion Detection Microservice**: Check the logs for the `motion-detection` container to see if there are any errors.

```
docker-compose logs -f motion-detection
```

## 2. Log Files

The application logs are stored in the `logs` directory. The following log files are created:

- `nexus-%DATE%.log`: The main application log file.
- `exceptions.log`: A log file for uncaught exceptions.
- `rejections.log`: A log file for unhandled promise rejections.

## 3. Contact

If you are still unable to resolve the issue, please contact the development team for assistance.
