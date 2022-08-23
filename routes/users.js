"use strict";

const User = require("../models/user");

const Router = require("express").Router;
const router = new Router();
const { authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser } = require("../middleware/auth");


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name}, ...]}
 *
 **/
//  router.use(authenticateJWT);
//  router.use(ensureLoggedIn);

router.get("/", async function (req, res, next) {
  const users = await User.all();
  return res.json({ users });
});


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get("/:username", ensureCorrectUser, async function (req, res, next) {

  const user = await User.get();
  return res.json({ user });
});


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/to", async function (req, res, next) {
  ensureCorrectUser();
  const messages = await User.messagesTo();
  return res.json({ messages });
});



/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/from", async function (req, res, next) {
  ensureCorrectUser()
  const messages = await User.messagesFrom();
  return res.json({ messages });
});


module.exports = router;