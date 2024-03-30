# Backend

This is the backend of the application, consisting of two key components: an **API** and a **WebSocket service**.

The [API](./app.js) accepts requests from the frontend of the system, in order to carry out certain tasks - for example logging in, creating a project, writing a comment, etc.

The [WebSocket service](./ws/wss.js) has a more specific purpose; this currently exists solely to enable two-way realtime communication between the server and multiple clients. This is the module that enables realtime collaborative editing.

## Installing and Running

### Install

1. Clone this repository.
2. Install the dependencies with `npm install`.
3. Set up a local MySQL instance according to the data schema.

### Run

1. Make sure your SQL instance is running.
2. Run the server with `npm run dev`.

### Troubleshooting
- If you get a `mysql` error `ER_NOT_SUPPORTED_AUTH_MODE`, try running `ALTER USER
'root'@'localhost' IDENTIFIED WITH mysql_native_password BY {your password};`.