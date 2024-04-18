# Local Installation

In order to set up a local instance of this application, you must first
[configure the database](#database-configuration). 

## Cloning the Repository

First, run the command

```
git clone https://github.com/PixlVault/pixelvault
```

## Database Configuration

This application uses [MySQL](https://www.mysql.com/); follow the instructions to
[download MySQL Community Edition](https://dev.mysql.com/downloads/mysql/) and install
it for your particular Operating System. The installation wizard will walk you through
a typical installation.

Once complete, verify that the server is running (on Windows systems, a `MYSQL99` service
will be running, where `99` can be any two-digit number - if this is not running,
right-click it and press `start`).

Now open the MySQL Command Line Client, sign in, and simply run:
```
source <full-path-to-cloned-repository>/data/init.sql
```

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

## Running the Backend

Now `cd` into the [backend](./backend/) directory, and run:

```
npm install
```

This will download and install this project's dependencies.

Once complete, simply run:

```
npm run dev
```

To run the backend server.

Note that tests can be run with `npm run test`.

## Running the Frontend

Similar to the backend, simply `cd` into the [frontend](./frontend/) directory, and run:

```
npm install
```

Again, this will download and install this project's dependencies.

Once complete, simply run:

```
npm run dev
```

This will run the React frontend, which can be accessed and interacted with by
navigating to the localhost URL outputted to the terminal.

The app should now be running in full! 🎉

# Credit
This project has been created by:
- Luke Bradley (@1b7)
- Matt Davies (@mattd311)
- Joshua Kay (@JoshEk101)
- Ryan Raulia (@ryanraulia)
- Elliott Watkiss-Leek (@Ell04)
- Sukh Sareen (@sukhsare)