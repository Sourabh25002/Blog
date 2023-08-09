// Import required modules
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const multer = require("multer");
const path = require("path");
const _ = require("lodash");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
// const { MongoClient } = require("mongodb");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// .connect("mongodb://127.0.0.1:27017/blogDB")
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

const postSchema = new mongoose.Schema({
  image: String,
  title: String,
  content: String,
});

const Post = mongoose.model("Post", postSchema);

// user login

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

// Home route
app.get("/", function (req, res) {
  res.render("homePage");
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

const homeStartingContent =
  "Welcome to My Blog! This is a place where I share my thoughts and experiences with the world. Here, you'll find a collection of articles on various topics, including technology, travel, and personal development. Feel free to explore and enjoy the content. If you have any questions or feedback, don't hesitate to reach out. Happy reading!";

app.get("/homePage", function (req, res) {
  res.render("homePage");
});

app.get("/main", async (req, res) => {
  try {
    const posts = await Post.find();
    res.render("main", {
      startingContent: homeStartingContent,
      posts: posts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/contact", function (req, res) {
  res.render("contact");
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/compose", function (req, res) {
  res.render("compose");
});

app.post("/compose", upload.single("postImage"), async (req, res) => {
  try {
    const post = new Post({
      image: req.file ? req.file.filename : "",
      title: req.body.postTitle,
      content: req.body.postBody,
    });

    await post.save();
    res.redirect("/main");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/posts/:postTitle", async (req, res) => {
  try {
    const requestedTitle = req.params.postTitle;
    const requestedPost = await Post.findOne({ title: requestedTitle });

    if (requestedPost) {
      res.render("posts", {
        post: requestedPost,
      });
    } else {
      res.render("error", {
        errorMessage: "Post not found",
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/posts/:postTitle/delete", async (req, res) => {
  try {
    const requestedTitle = req.params.postTitle;
    const deletedPost = await Post.findOneAndDelete({ title: requestedTitle });

    if (deletedPost) {
      res.redirect("/main");
    } else {
      res.render("error", {
        errorMessage: "Post not found",
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server and listen on port 3000
app.listen(process.env.PORT, function () {
  console.log("Server is running on port 3000");
});
