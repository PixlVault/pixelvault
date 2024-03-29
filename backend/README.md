# Marketplace API

This is the prototype for the 'marketplace' - i.e. basically everything
that isn't the editor.

As of right now this is a very barebones API which just lets us `POST` users
to or `GET` them from our API (which itself is connected to a MySQL instance).

At present, this is a bit strange to install and run.

## Installing and Running

### Troubleshooting

- NOTE: When running tests, due to strange interactions between the different testing areas,
  `npm run test` does not currently work, but `npm run test user login project` currently does.
- If you get a `mysql` error `ER_NOT_SUPPORTED_AUTH_MODE`, try running `ALTER USER
'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';`. This probably
  **should not make it into production**.

### Install

1. Clone this repository.
2. Install the dependencies with `npm install`.
3. Set up a local MySQL instance according to the schema in [`database.js`](./utils/database.js).

### Run

1. Make sure your SQL instance is running.
2. Run the server with `npm run dev`.

## Dependencies

### Main

- `express` - the main API framework;
- `mysql` - allows us to connect to and query a MySQL database;
- `argon2` - secure password hashing;
- `dotenv` - environment variables;
- `jsonwebtoken` - allows us to generate and sign tokens, for authorisation purposes.

### Development Dependencies

#### Testing

- `jest` - main testing framework;
- `supertest` - lets us set up and query our API in tests;

#### Misc

- `eslint` - for coding standards.
