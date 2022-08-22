"use strict";

const db = require('../db');
const bcrypt = require('bcrypt');
const { UnauthorizedError } = require('../expressError');
const BCRYPT_WORK_FACTOR = 12;

/** User of the site. */

class User {


  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users
            (username,
            password,
            first_name,
            last_name,
            phone,
            join_at,
            last_login_at)
      VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
      RETURNING username, password, first_name, last_name, phone`,
      [username,
        hashedPassword,
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
      if (await bcrypt.compare(password, user.password) === true) {
        // return res.json({ message: "Logged in!" });
        return true;
      }
    }
    return false;
    // throw new UnauthorizedError("Invalid user/password");
    // const result = await bcrypt.compare(password, user.password);
    // return result;
  }


  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users
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
    return results.rows;

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

    const uResults = await db.query(
      `SELECT id, to_username, body, sent_at, read_at
      FROM messages
      WHERE from_username = $1`,
      [username]);

    const user = uResults.rows[0];
    const toUser = user.to_username;

    const mResults = await db.query(
      `SELECT username, first_name, last_name, phone
      FROM users u
      WHERE username = $1`,
      [toUser]);

    user.to_user = mResults.rows[0];
    delete user.to_username;
    return [user];
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
      `SELECT m.id,
            m.body,
            m.sent_at,
            m.read_at,
            f.username,
            f.first_name,
            f.last_name,
            f.phone
      FROM messages m
      JOIN users f on m.from_username = f.username
      JOIN users t on m.to_username = t.username
      WHERE m.to_username = $1`,
      [username]);

    const m = results.rows[0];

    return [{
      id: m.id,
      from_user: {
        username: m.username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at
    }];

  }
}


module.exports = User;
