const db = require("../models");
const Posts = db.posts;
const Diaries = db.diaries;

// Create a new post
exports.create = (req, res) => {
  // Validate request
  if (!req.body.ownerID) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  //find diaryID
  Diaries.findOne({
    ownerID: req.body.ownerID
  })
    .then(data => {

      // Create a post
      const posts = new Posts({
        name: req.body.name,
        ownerID: req.body.ownerID,
        description: req.body.description,
        diaryID: data.id,
        picture: req.body.picture
      });

      // Save post in the database
      posts
        .save(posts)
        .then(data => {
          res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message: err.message || "Some error occurred while creating the post."
          });
        });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving diary."
      });
    });
};

// Retrieve all posts from the database.
exports.findAll = (req, res) => {

  //todo pagination
  Posts.find().sort({
    'createdAt': -1
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving posts."
      });
    });
};

// Find a posts by owner with an id
exports.findByOwner = (req, res) => {
  const id = req.params.id;
  var diary_id;

  Posts.find({
    ownerID: id
  }).sort({
    'createdAt': -1
  })
    .then(data => {
      if (!data)
        res.status(404).send({
          message: "Not found posts with diary_id " + diary_id
        });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({
          message: "Error retrieving posts with diary_id " + diary_id
        });
    });
};

// Find a posts by an id
exports.findOneByID = (req, res) => {
  const id = req.params.id;

  Posts.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({
          message: "Not found posts with id " + id
        });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({
          message: "Error retrieving posts with id1 " + id
        });
    });
};


// Update a Post by the id in the request
exports.update = (req, res) => {

  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  Posts.findByIdAndUpdate(id, req.body, {
    useFindAndModify: false
  })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update post with id=${id}. Maybe post was not found!`
        });
      } else res.send({
        message: "Post was updated successfully."
      });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating post with id=" + id
      });
    });
};

// Delete a Owner with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Posts.findByIdAndRemove(id)
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete post with id=${id}. Maybe post was not found!`
        });
      } else {
        res.send({
          message: "Post was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete post with id=" + id
      });
    });
};

// Update a Post by the id in the request
exports.likes = (req, res) => {

  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }
  const idPost = req.params.id;
  const id = req.body.id;

  Posts.findById(idPost)
    .then(data => {
      if (!data)
        res.status(404).send({
          message: "Not found posts with id " + idPost
        });
      else {
        if (!data.likes.includes(idPost)) {
          Posts.findOneAndUpdate({
            _id: idPost
          }, {
            $push: {
              likes: id
            }
          })
            .then(data => {
              if (!data) {
                res.status(404).send({
                  message: `Cannot update post with id=${idPost}. Maybe post was not found!`
                });
              } else {
                res.send({
                  message: "Liked"
                });
              }
            })
            .catch(err => {
              res.status(500).send({
                message: "Error updating post"
              });
            });
        } else {
          res.send({
            message: "Liked"
          });
        }
      }
    })
    .catch(err => {
      res
        .status(500)
        .send({
          message: "Error retrieving posts with id " + idPost
        });
    });
};

// Update a Post by the id in the request
exports.unlikes = (req, res) => {

  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }
  const idPost = req.params.id;
  const id = req.body.id;

  Posts.findById(idPost)
    .then(data => {
      if (!data)
        res.status(404).send({
          message: "Not found posts with id " + idPost
        });
      else {
        if (!data.likes.includes(idPost)) {
          Posts.updateOne({
            _id: idPost,
            likes: { $in: [id] }
          }, { $pull: { likes: { $in: [id] } } })
            .then(data => {
              if (!data) {
                res.status(404).send({
                  message: `Cannot update post with id=${idPost}. Maybe post was not found!`
                });
              } else {
                res.send({
                  message: data
                });
              }
            })
            .catch(err => {
              res.status(500).send({
                message: "Error updating post " + err
              });
            });
        } else {
          res.send({
            message: "Liked"
          });
        }
      }
    })
    .catch(err => {
      res
        .status(500)
        .send({
          message: "Error retrieving posts with id " + idPost + " " + err
        });
    });


};