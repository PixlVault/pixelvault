const mysql = require('mysql');

const host = process.env.NODE_ENV === 'test'
  ? process.env.MYSQL_TEST_HOST
  : process.env.MYSQL_HOST;

const connection = mysql.createConnection({
  host,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

connection.connect();
console.log('Connecting to DB:', host);

module.exports = connection;
