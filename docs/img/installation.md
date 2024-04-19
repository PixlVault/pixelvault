Matthew Davies, Luke Bradley, Josh Kay, Ryan Raulia, Sukh Sareen, Elliott Watkiss-Leek

# Live Application
This can be found by opening any modern, up-to-date browser (e.g. Chrome or Firefox)
and navigating to https://159.65.213.208/.

# Pre-installation

## Cloning the Repository

First, run the command `git clone https://github.com/PixlVault/pixelvault`

## Database Configuration

This application uses [MySQL](https://www.mysql.com/); follow the instructions to
[download MySQL Community Edition](https://dev.mysql.com/downloads/mysql/) and install
it for your particular Operating System. The installation wizard will walk you through
a typical installation.

Once complete, verify that the server is running (on Windows systems, a `MYSQL99` service
will be running, where `99` can be any two-digit number - if this is not running,
right-click it and press `start`).

Now open the MySQL Command Line Client, sign in, and simply run `source <full-path-to-cloned-repository>/data/init.sql`.

If this step is successful, you will see a series of statements affirming creation
of the database and its tables.

Once this is complete, enter the following query:
```
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '<your password>';.
```

Then, within the backend's [`.env`](./backend/.env), update the following two lines accordingly:

```
MYSQL_USER='root' # Change this to your username, if this is not 'root'
MYSQL_PASSWORD='password' # Change this to the password you used above.
```

# Local Installation

In order to set up a local instance of this application, complete the following steps.

## Running the Backend

- `cd` into the [backend](./backend/) directory, and run `npm install`.
- This will download and install this project's dependencies.
- Once complete, simply run: `npm run dev` to run the backend server.
- Note that tests can be run with `npm run test`.

## Running the Frontend

- Similar to the backend, simply `cd` into the [frontend](./frontend/) directory, and run `npm install`.
- Again, this will download and install this project's dependencies.
- Once complete, simply run: `npm run dev`.
- This will run the React frontend, which can be accessed and interacted with by
navigating to the localhost URL outputted to the terminal.

The app should now be running in full.

# Deployment

In order to set up a remote production instance of this application on a server, complete the following
steps.

## 1. Make production-related changes to PixelVault source

- Set the following in the pixelvault/backend/.env file:
    - Set JWT_SECRET to a randomly generated secret string.
    - Set MYSQL_PASSWORD to a randomly generated secret string.
    - Set ROOT_PASSWORD to a randomly generated secret string.
    - Set NODE_ENV to 'production'.
    - Set CORS_ORIGIN to the address of the production server.
- Set the following in the pixelvault/frontend/.env file:
    - Set VITE_API_URL_BASE to a HTTPS url pointing to the production server with `/api` as the path.
        - For example: `https://SERVER.ADDRESS/api`.
    - Set VITE_WSS_URL to a WSS url pointing to the production server with the HTTPS port specified.
        - For example: `wss://SERVER.ADDRESS:443`.

## 2. Install NodeJS

- Install NVM: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash`.
- Set Up NVM: `source ~/.nvm/nvm.sh`.
- Install NodeJS: `nvm install node`.

## 3. Generate self-signed certificate for HTTPS

- Generate certificate (Replace output paths as required): `sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ~/dev/pixelvault/backend/certs/selfsigned.key -out ~/dev/pixelvault/backend/certs/selfsigned.crt`

## 4. Install PM2

- Install PM2: `npm install pm2 -g`

## 5. Deploy the application

- Deploy: `sudo bash pixelvault/deploy.sh`
