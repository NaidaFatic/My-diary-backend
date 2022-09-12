const db = require("../models");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require("../config/env.config.js");
const Owners = db.owners;
const Diaries = db.diaries;

//create jwt
function encodeJWT(owner) {
  return jwt.sign({
    uid: owner._id,
    email: owner.email,
    exp: Math.floor(Date.now() / 10) + (6000 * 60)
  }, config.key)
}

// Create a new Owner
exports.create = (req, res, callback) => {
  const salt = bcrypt.genSaltSync(config.salt);
  const hash = bcrypt.hashSync(req.body.password, salt);

  // Validate request
  if (!req.body.name || !req.body.surname || !req.body.email || !req.body.password) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  } else if (req.body.name.length < 3 || req.body.surname.length < 3 || req.body.email.length < 3 || req.body.password.length < 3) {
    res.status(400).send({
      message: "Content has too few characters!"
    });
    return;
  }

  // Create a owner
  const owner = new Owners({
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
    password: hash,
    age: req.body.age,
    comment: req.body.comment
  });


  Owners.findOne({
    email: req.body.email
  })
    .then(data => {
      if (data) {
        res.status(404).send({
          message: "Email already in use! email : " + req.body.email
        });
        return;
      } else {
        // Save owner in the database
        owner
          .save(owner)
          .then(data => {

            // Create a diary
            const diary = new Diaries({
              ownerID: data._id
            });
            try {
              Diaries.find({
                ownerID: data._id
              })
                .then(data => {
                  // Save diary in the database
                  diary
                    .save(diary)
                    .catch(err => {
                      res.status(500).send({
                        message: err.message || "Some error occurred while creating the diary."
                      });
                    });
                })
                .catch(err => {
                  res.status(500).send({
                    message: err.message || "Some error occurred while retrieving diary."
                  });
                });
            } catch (e) { console.log(e); }
            res.json({
              token: encodeJWT(data)
            });
          })
          .catch(err => {
            res.status(500).send({
              message: err.message || "Some error occurred while creating the profile."
            });
          });
      }
    }).catch(err => {
      res
        .status(500)
        .send({
          message: "Error retrieving profiles with email: Error => " + err
        });
      return;
    });


};

// Retrieve all Owners from the database.
exports.findAll = (req, res) => {
  const name = req.query.name;

  if (name) {
    var conditionFirstName = name ? {
      name: {
        $regex: new RegExp(name),
        $options: "i"
      }
    } : {};

    var conditionLastName = name ? {
      surname: {
        $regex: new RegExp(name),
        $options: "i" //not case sensitive
      }
    } : {};

    Owners.find({ $or: [conditionFirstName, conditionLastName] }).sort({
      'createdAt': -1
    })
      .then(data => {
        //console.log(conditionFirstName)
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving owners."
        });
      });
  }
};

// Find a single Owners with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Owners.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({
          message: "Not found profiles with id " + id
        });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({
          message: "Error retrieving profiles with id=" + id
        });
    });
};

// Login
exports.login = (req, res) => {
  const emailReq = req.body.email;
  const passwordReq = req.body.password;

  Owners.findOne({
    email: emailReq
  })
    .then(data => {
      if (!data)
        res.status(404).send({
          message: "No profiles found with email " + emailReq
        });
      else {
        bcrypt.compare(passwordReq, data.password, (function (err, result) {
          if (result) {
            res.json({
              token: encodeJWT(data)
            });
          } else res.status(404).send({
            message: "No profiles found with this email and password"
          });
        }));
      }
    })
    .catch(err => {
      res
        .status(500)
        .send({
          message: "Error retrieving profiles with email: Error => " + err
        });
    });
};

// Update a Owner by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  Owners.findByIdAndUpdate(id, req.body, {
    useFindAndModify: false
  })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update profile with id=${id}. Maybe profile was not found!`
        });
      } else res.send({
        message: "Profile was updated successfully."
      });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Profile with id=" + id
      });
    });
};

// Delete a Owner with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Owners.findByIdAndRemove(id)
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete profile with id=${id}. Maybe profile was not found!`
        });
      } else {
        res.send({
          message: "Profile was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Owners with id=" + id
      });
    });
};

// Update a owner send friend request
exports.sendRequest = (req, res) => {

  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }
  const idOwner = req.params.id;
  const id = req.body.friendID;

  Owners.findById(idOwner)
    .then(data => {
      if (!data)
        res.status(404).send({
          message: "Not found profiles with id " + idOwner
        });
      else {
        if (!data.friendsRequest.includes(id)) {
          Owners.findOneAndUpdate({
            _id: idOwner
          }, {
            $addToSet: {
              friendsRequest: id
            }
          })
            .then(data => {
              if (!data) {
                res.status(404).send({
                  message: `Cannot update owner with id=${idOwner}. Maybe post was not found!`
                });
              } else {
                res.send({
                  message: "Request send!"
                });
              }
            })
            .catch(err => {
              res.status(500).send({
                message: "Error sending request"
              });
            });
        } else {
          res.send({
            message: "Request send!"
          });
        }
      }
    })
    .catch(err => {
      res
        .status(500)
        .send({
          message: "Error sending request with id " + idOwner
        });
    });
};

// Update a owner add friend
exports.addFriend = (req, res) => {

  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }
  const idOwner = req.params.id;
  const id = req.body.friendID;

  Owners.findById(idOwner)
    .then(data => {
      if (!data)
        res.status(404).send({
          message: "Not found profiles with id " + idOwner
        });
      else {
        if (data.friendsRequest.includes(id)) {
          Owners.findOneAndUpdate({
            _id: idOwner
          }, {
            $pull: {
              friendsRequest: id
            }, $addToSet: {
              friends: id
            }
          })
            .then(data => {
              if (!data) {
                res.status(404).send({
                  message: `Cannot update owner with id=${idOwner}. Maybe post was not found!`
                });
              } else {
                Owners.findOneAndUpdate({
                  _id: id
                }, {
                  $addToSet: {
                    friends: idOwner
                  }
                }).then(data => {
                  res.send({
                    message: "Friend added!"
                  });
                }).catch(err => {
                  res.status(500).send({
                    message: "Error sending request"
                  });
                });
              }
            })
            .catch(err => {
              res.status(500).send({
                message: "Error sending request"
              });
            });
        } else {
          res.send({
            message: "Friend not found in friend request"
          });
        }
      }
    })
    .catch(err => {
      res
        .status(500)
        .send({
          message: "Error sending request with id " + idOwner
        });
    });


};