module.exports = app => {
  const owners = require("../controllers/owners.controllers.js");

  var router = require("express").Router();

  // Create a new owner
  router.post("/", owners.create);

  // Retrieve all owners
  router.get("/search", owners.findAll);

  // Retrieve a single owners with id
  router.get("/:id", owners.findOne);

  // Update a owners with id
  router.put("/:id", owners.update);

  // Login 
  router.post("/login", owners.login);

  // Delete a owners with id
  router.delete("/:id", owners.delete);

  // Send Request 
  router.put("/request/:id", owners.sendRequest);

  // Add Friend 
  router.put("/addFriend/:id", owners.addFriend);

  app.use('/api/owners', router);
};