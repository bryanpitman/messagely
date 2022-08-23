"use strict";

const Message = require("../models/message");

const Router = require("express").Router;
const router = new Router();
// router.use(authenticateJWT);
// router.use(ensureLoggedIn);

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", async function (req, res, next) {

  const message = await Message.get();
  return res.json({ message });
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", async function (req, res, next) {
  const { username, to_username, body } = req.body;
  const message = await Message.create([username, to_username, body]);
  return res.json({ message });
});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/
router.post(":id/read", async function (req, res, next) {
  const message = await Message.markRead(id);
  return res.json({ message });

});


module.exports = router;