# Backend

This is the backend of the application, consisting of two key components: an **API** and a **WebSocket service**.

The [API](./app.js) accepts requests from the frontend of the system, in order to carry out certain tasks - for example logging in, creating a project, writing a comment, etc.

The [WebSocket service](./ws/wss.js) has a more specific purpose; this currently exists solely to enable two-way realtime communication between the server and multiple clients. This is the module that enables realtime collaborative editing.