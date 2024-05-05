var express = require("express");
var cors = require("cors");
var mongoose = require("mongoose")
var app = express();
var bodyParser = require("body-parser");
app.use(cors());
app.use(bodyParser.json());

var errorHandler = require('errorhandler');
app.use(errorHandler({ dumpExceptions: true, showStack: true })); 

const port = "8081";
const host = "localhost";

const { MongoClient, ObjectId } = require("mongodb");
const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);
const db = client.db("savor")

const id = new mongoose.Types.ObjectId();

app.listen(port, () => {
    console.log("App listening at http://%s:%s", host, port);
});

app.get("/user/username/:username", async (req, res) => {
    try {
        await client.connect();
        const userUsername = req.params.username;
        console.log(userUsername);
       
        const query = {"username": userUsername};
        const result = await db.collection("users").find(query).toArray();
        console.log("Result :", result);
        if (!result) {
            res.send("Not Found").status(404);
        } else {
            res.status(200).send(result);
        }
        } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send({ error: 'An internal server error occurred' });
    }
  });

  app.get("/user/email/:email", async (req, res) => {
    try {
        await client.connect();
        const userEmail = req.params.email;
        console.log(userEmail);
       
        const query = {"email": userEmail};
        const result = await db.collection("users").find(query).toArray();
        console.log("Result :", result);
        if (!result) {
            res.send("Not Found").status(404);
        } else {
            res.status(200).send(result);
        }
        } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send({ error: 'An internal server error occurred' });
    }
  });

  app.get("/recipe/id/:id", async (req, res) => {
    try {
        await client.connect();
        const recipeId = req.params.id;
        var o_id = new mongoose.Types.ObjectId(recipeId);
        console.log(recipeId);
       
        const query = {"_id": o_id};
        const result = await db.collection("recipes").findOne(query);
        console.log("Result :", result);
        if (!result) {
            res.send("Not Found").status(404);
        } else {
            res.status(200).send(result);
        }
        } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send({ error: 'An internal server error occurred' });
    }
  });

    app.post("/createAccount", async (req, res) => {
        try {
                await client.connect();
                const newUser = req.body;
                const result = await db.collection("users").insertOne(newUser);
            } catch (error) {
                console.error("An error occurred:", error);
                res.status(500).send({ error: 'An internal server error occurred' });
            }
    });

    app.post("/uploadRecipe/:author", async (req, res) => {
        try {
                await client.connect();
                console.log("Uploading recipe");
                const newRecipe = req.body;
                const result = await db.collection("recipes").insertOne(newRecipe);
                const recipeId = result.insertedId;
                const query = {username: req.params.author};
                const updateData = { $push: {"userRecipes": recipeId}}
                const authorUser = await db.collection("users").updateOne(query, updateData)
                res.status(200);
                res.send();
            } catch (error) {
                console.error("An error occurred:", error);
                res.status(500).send({ error: 'An internal server error occurred' });
            }
    });

    app.post("/likeRecipe/:recipeId/:author/:user", async (req, res) => {
        try{
            await client.connect();
            console.log("Increasing recipe likes");
            const recipeId = req.params.recipeId;
            var o_id = new mongoose.Types.ObjectId(recipeId);
            console.log(recipeId);
            var query = {"_id": o_id};
            var updateData = { $inc: {"likes": 1}}
            const incRecipeLikes = await db.collection("recipes").updateOne(query, updateData)

            console.log("Increasing author likes");
            const author = req.params.author;
            query = {"username": author};
            updateData = { $inc: {"totalLikes": 1}}
            const incAuthorLikes = await db.collection("users").updateOne(query, updateData)

            console.log("Adding to user's liked recipes");
            const user = req.params.user;
            query = {"username": user};
            updateData = { $push: {"likedRecipes": recipeId}}
            const likedUser = await db.collection("users").updateOne(query, updateData)
            res.status(200);
            res.send();
        } catch {
            console.error("An error occurred:", error);
            res.status(500)
            res.send({ error: 'An internal server error occurred' });
        }
    });

    app.post("/unlikeRecipe/:recipeId/:author/:user", async (req, res) => {
        try{
            await client.connect();
            const recipeId = req.params.recipeId;
            var o_id = new mongoose.Types.ObjectId(recipeId);
            console.log(recipeId);
            var query = {"_id": o_id};
            var updateData = { $inc: {"likes": -1}}
            const incRecipeLikes = await db.collection("recipes").updateOne(query, updateData)

            const author = req.params.author;
            query = {"username": author};
            updateData = { $inc: {"totalLikes": -1}}
            const incAuthorLikes = await db.collection("users").updateOne(query, updateData)

            const user = req.params.user;
            query = {"username": user};
            updateData = { $pull: {"likedRecipes": recipeId}}
            const likedUser = await db.collection("users").updateOne(query, updateData)
            res.status(200);
            res.send();
        } catch {
            console.error("An error occurred:", error);
            res.status(500)
            res.send({ error: 'An internal server error occurred' });
        }
    });