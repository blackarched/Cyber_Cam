# Nexus Security Grid - System Architecture

## 1. Overview

The Nexus Security Grid is a comprehensive, production-ready surveillance and security system designed for real-time monitoring and management of security nodes. It features a modern, intuitive user interface, a robust backend, and a scalable, microservices-based architecture.

## 2. Core Components

The system is composed of the following core components:

- **Frontend Application**: A single-page application (SPA) built with HTML, CSS, and JavaScript, providing a heads-up display (HUD) for monitoring and controlling the security grid.
- **Backend API Server**: A Node.js application built with Express, responsible for handling API requests, managing user authentication, and communicating with the other components.
- **WebSocket Server**: Integrated with the backend, the WebSocket server provides real-time communication between the backend and the frontend for live video streams and system status updates.
- **PostgreSQL Database**: A relational database used to store user data, security node configurations, and other persistent data.
- **Redis Server**: An in-memory data store used for caching, session management, and as a message broker for inter-service communication.
- **Motion Detection Microservice**: A Python-based microservice that uses OpenCV to perform motion detection on video streams.
- **HashiCorp Vault**: A secrets management tool used to securely store and manage sensitive data, such as API keys, database credentials, and JWT secrets.

## 3. System Architecture Diagram

```
+-----------------+      +-----------------+      +-----------------+
|                 |      |                 |      |                 |
|  Frontend App   |----->|  Backend API    |----->|  PostgreSQL DB  |
| (HTML/CSS/JS)   |      | (Node.js/Express) |      |                 |
|                 |      |                 |      |                 |
+-----------------+      +-----------------+      +-----------------+
      ^   |                    ^   |                    ^
      |   v                    |   v                    |
+-----------------+      +-----------------+      +-----------------+
|                 |      |                 |      |                 |
| WebSocket Server|----->|  Redis Server   |----->| Motion Detection|
|   (Real-time)   |      | (Cache/Broker)  |      |  (Python/OpenCV)|
|                 |      |                 |      |                 |
+-----------------+      +-----------------+      +-----------------+
                                 ^
                                 |
                         +-----------------+
                         |                 |
                         | HashiCorp Vault |
                         | (Secrets Mgmt)  |
                         |                 |
                         +-----------------+
```

## 4. Data Flow

### 4.1. User Authentication

1. The user enters their credentials in the frontend application.
2. The frontend sends a POST request to the `/api/auth/login` endpoint on the backend API server.
3. The backend verifies the credentials against the data stored in the PostgreSQL database.
4. If the credentials are valid, the backend generates a JSON Web Token (JWT) and sends it back to the afrontend.
5. The frontend stores the JWT and includes it in the `Authorization` header of all subsequent requests.

### 4.2. Video Streaming

1. The frontend establishes a WebSocket connection with the backend server.
2. The backend receives the video stream from the security node.
3. The backend forwards the video stream to the frontend via the WebSocket connection.
4. The frontend displays the live video stream in the camera matrix.

### 4.3. Motion Detection

1. The backend receives the video stream from the security node.
2. The backend publishes the video stream to a Redis message queue.
3. The motion detection microservice subscribes to the Redis message queue and receives the video stream.
4. The motion detection microservice processes the video stream using OpenCV to detect motion.
5. If motion is detected, the motion detection microservice publishes a message to another Redis message queue.
6. The backend subscribes to the Redis message queue and receives the motion detection alert.
7. The backend sends the motion detection alert to the frontend via the WebSocket connection.

## 5. Security

The Nexus Security Grid is designed with security in mind and includes the following security features:

- **Authentication**: User authentication is handled by the backend using JWTs.
- **Authorization**: The backend uses role-based access control (RBAC) to restrict access to certain API endpoints.
- **Input Validation**: The backend uses Joi to validate all incoming data to prevent common vulnerabilities, such as SQL injection and cross-site scripting (XSS).
- **Secrets Management**: All sensitive data is stored in HashiCorp Vault and is not hard-coded in the application.
- **Rate Limiting**: The backend uses rate limiting to prevent brute-force attacks.
- **IP Filtering**: The backend uses IP filtering to block requests from malicious IP addresses.
- **CSRF Protection**: The backend uses CSRF protection to prevent cross-site request forgery attacks.
- **Helmet**: The backend uses Helmet to set various HTTP headers to secure the application.

## 6. Scalability

The Nexus Security Grid is designed to be scalable and can be deployed in a distributed environment. The use of a microservices-based architecture allows for individual components to be scaled independently. The use of a message broker for inter-service communication allows for a loosely coupled architecture that is resilient to failure.
