const mysql = require('mysql');
const argon2 = require('argon2');

const host = process.env.NODE_ENV === 'test'
  ? process.env.MYSQL_TEST_HOST
  : process.env.MYSQL_HOST;

const db = mysql.createConnection({
  host,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

db.connect();
console.log('Connecting to DB:', host);

/**
 * Creates a root account according to `.env` variables - if it doesn't already exist.
 */
const tryCreateRootAccount = () => {
  if (process.env.ROOT_USERNAME === undefined || process.env.ROOT_PASSWORD === undefined) {
    console.log(
      'WARNING: Missing `ROOT_USERNAME` and/or `ROOT_PASSWORD` environment variables. '
      + 'Root user will not be created.',
    );
  } else {
    argon2.hash(process.env.ROOT_PASSWORD)
      .then((passwordHash) => {
        db.query(
          'INSERT INTO user (username, password_hash, email, is_admin) VALUES (?, ?, ?, 1)'
          + ' ON DUPLICATE KEY UPDATE password_hash = ?;',
          [process.env.ROOT_USERNAME, passwordHash, `${process.env.ROOT_USER}@donotemail.com`, passwordHash],
          (err) => {
            if (err) console.error('Error in creating root account');
          },
        );
        console.log('root user inserted, or already existed.');
      })
      .catch((err) => {
        console.log(err);
        console.error('Error in generating password hash for root user');
      });
  }
};

tryCreateRootAccount();

/**
 * Supports the construction of variable-parameter queries by extracting
 * a query argument into an array of key-value pairs.
 * This array will always return the same order, unlike the `Object.keys` iterator.
 * @param {*} args An object consisting of key-value arguments passed to the query.
 * @param {*} fields An object containing two keys: `required` and `optional`; each
 *                   containing an array of the (string) names of required and optional
 *                   fields respectively.
 * @returns An object consisting of two arrays; `fields` contains
 *          a list of all keys present, and `values` contains their values.
 * @throws An error if any required key is missing, of the form
 *         "Missing required field: `<missing field name>`"
 */
const extractArgs = (args, fields) => {
  const argValuePairs = { fields: [], values: [] };
  fields.required.forEach((field) => {
    if (args[field] === undefined) throw new Error(`Missing required field: \`${field}\``);
    argValuePairs.fields.push(field);
    argValuePairs.values.push(args[field]);
  });

  fields.optional.forEach((field) => {
    if (args[field] !== undefined) {
      argValuePairs.fields.push(field);
      argValuePairs.values.push(args[field]);
    }
  });

  return argValuePairs;
};

module.exports = { db, extractArgs };
