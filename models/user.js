"use strict";

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
    if (this.username === undefined) {
      const result = await db.query(
        `INSERT INTO customers
            (username, password, first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING username, password, first_name, last_name, phone, notes`,
        [this.username,
        this.password,
        this.firstName,
        this.lastName,
        this.phone,
        this.notes],
      );
      return result.rows[0];

    }
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password
         FROM users
         WHERE username = $1`,
      [username]);
    const user = result.rows[0];
    return user;

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
      FROM users`,
     )
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
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
  }
}


module.exports = User;
