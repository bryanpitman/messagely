"use strict";

const db = require('../db');
const bcrypt = require('bcrypt');
const { UnauthorizedError } = require('../expressError');

/** User of the site. */

class User {

  constructor({ username, password, first_name, last_name, phone }) {
    this.username = username;
    this.password = password;
    this.first_name = first_name;
    this.last_name = last_name;
    this.phone = phone;
  }

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    console.log('run register');
    // if (username === undefined) {
    const result = await db.query(
      `INSERT INTO users
            (username, password, first_name, last_name, phone, join_at, last_login_at)
             VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
             RETURNING username, password, first_name, last_name, phone`,
      [username,
        password,
        first_name,
        last_name,
        phone],
    );
    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password
         FROM users
         WHERE username = $1`,
      [username]);
    const user = result.rows[0];
    if (user) {
      //   if (await bcrypt.compare(password, user.password) === true) {
      //     return res.json({ message: "Logged in!" });
      //   }
      // }
      // throw new UnauthorizedError("Invalid user/password");
      const result = await bcrypt.compare(password, user.password);
      return result;
    }

  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE messages
       SET last_login_at = current_timestamp
         WHERE username = $1
         RETURNING username, last_login_at`,
      [username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No such user: ${username}`);

    return user;

  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const results = await db.query(
      `SELECT username, first_name, last_name
      FROM users`);
    return results;

  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const results = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
      FROM users
      WHERE username = $1`,
      [username]);
    return results.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const results = await db.query(
      `SELECT m.id, m.to_user, m.body, m.sent_at, m.read_at
      FROM users u
      JOIN messages m on u.username = m.from_username
      WHERE m.to_username = $1`,
      [username]);
    return results.rows[0];
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const results = await db.query(
      `SELECT m.id, m.from_user, m.body, m.sent_at, m.read_at
      FROM users u
      JOIN messages m on u.username = m.to_username
      WHERE m.from_username = $1`,
      [username]);
    return results.rows[0];
  }
}


module.exports = User;
