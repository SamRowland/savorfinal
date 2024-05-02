var express = require("express");
var cors = require("cors");
var app = express();
var bodyParser = require("body-parser");
app.use(cors());
app.use(bodyParser.json());

const port = "8081";
const host = "localhost";

const { MongoClient } = require("mongodb");
const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);
const db = client.db("savor")

app.listen(port, () => {
    console.log("App listening at http://%s:%s", host, port);
});

app.get("/savor/user/username/:username", async (req, res) => {
    try {
        await client.connect();
        const userUsername = req.params.username;
        console.log(userUsername);
       
        console.log("Node connected successfully to GET-id MongoDB");
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

  app.get("/savor/user/email/:email", async (req, res) => {
    try {
        await client.connect();
        const userEmail = req.params.email;
        console.log(userEmail);
       
        console.log("Node connected successfully to GET-id MongoDB");
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