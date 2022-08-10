module.exports = app => {
    const posts = require("../controllers/posts.controllers.js");

    var router = require("express").Router();

    // Create a new post
    router.post("/", posts.create);

    // Retrieve all posts
    router.get("/", posts.findAll);

    // Retrieve a single post with id
    router.get("/post/:id", posts.findOneByID);

    // Retrieve a posts by one owner with id
    router.get("/owner/:id", posts.findByOwner);

    // Update a post with id
    router.put("/:id", posts.update);

    // Update a posts like with id
    router.put("/likes/:id", posts.likes);

    // Update a posts unlike with id
    router.put("/unlikes/:id", posts.unlikes);

    // Delete a post with id
    router.delete("/:id", posts.delete);

    app.use('/api/posts', router);
};