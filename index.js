const express = require("express");
const cors = require("cors");

const app = express();

var corsOptions = {
  origin: ["http://localhost:8080",
    "http://localhost:3000",
    "https://my-diary-backend-api.herokuapp.com",
    "https://my-diary-frontend.vercel.app",
    "http://onlinediarybackend1-env.eba-jcdedauh.eu-central-1.elasticbeanstalk.com"
  ]
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./models");
const { NativeDate } = require("mongoose");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to application." });
});

require("./routes/owners.routes")(app);
require("./routes/diaries.routes")(app);
require("./routes/posts.routes")(app);
require("./routes/comments.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8081;
const DB = process.env.URL;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
