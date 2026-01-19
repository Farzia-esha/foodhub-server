const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion,ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.zeenoci.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  const db = client.db("foodhub");
  const itemsCollection = db.collection("items");


  // GET all items
  app.get("/items", async (req, res) => {
    try {
      const result = await itemsCollection.find().toArray();
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: "Server error" });
    }
  });

  // Latest products
  app.get("/latestItems", async (req, res) => {
    const result = await itemsCollection
      .find()
      .sort({ _id: -1 })
      .limit(8)
      .toArray();
    res.send(result);
  });

  // POST new product
  app.post("/items", async (req, res) => {
    const newProduct = req.body;
    const result = await itemsCollection.insertOne(newProduct);
    res.send({ success: true, result });
  });

  // GET single product by ID
app.get("/items/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const product = await itemsCollection.findOne({ _id: new ObjectId(id) });
    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }
    res.send(product);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server error" });
  }
});

app.get("/ManageItems", async (req, res) => {
  try {
    const email= req.query.email;
    const query = email ? { addedBy : email } : {};
    const result = await itemsCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  } 
});

  // DELETE product by ID
  app.delete("/ManageItems/:id", async (req, res) => {
    try {
      const id = req.params.id; 
      const result = await itemsCollection.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        return res.status(404).send({ error: "Product not found" });
      }
      res.send({ success: true, result });
    } catch (error) {
      res.status(500).send({ error: "Server error" });
    }
  });
  app.put("/ManageItems/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;

    const result = await itemsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server error" });
  }
});

//start of the index.js
  console.log("MongoDB Ready");
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

