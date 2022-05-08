const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
  const authHeaders = req.headers.authorization;
  if (!authHeaders) {
    return res.status(401).send({ message: "Unauthorized access." });
  }
  const token = authHeaders.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access!!" });
    }
    console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });
}

//database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@amazon.38elh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const serviceCollection = client.db("wareHouse").collection("carServices");

    //Get inventories
    app.get("/carServices", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    //Get inventory
    app.get("/carServices/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.findOne(query);
      res.send(result);
    });

    //User login
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    // Post inventories
    app.post("/carServices", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const newInventory = req.body;
        console.log("Adding new inventory", newInventory);
        const result = await serviceCollection.insertOne(newInventory);
        res.send(result);
      } else {
        res.status(403).send({ message: "Forbidden Access!!" });
      }
    });

    //Update delivery inventory
    app.patch("/carServices/:id", async (req, res) => {
      const id = req.params.id;
      const updatedInventory = req.body;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedItem = {
        $set: {
          quantity: updatedInventory.quantity,
        },
      };
      const result = await serviceCollection.updateOne(
        query,
        updatedItem,
        options
      );
      res.send(result);
    });
    //Update add inventory
    app.put("/carServices/:id", async (req, res) => {
      const id = req.params.id;
      const updatedInventory = req.body;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedItem = {
        $set: {
          quantity: updatedInventory.quantity,
        },
      };
      const result = await serviceCollection.updateOne(
        query,
        updatedItem,
        options
      );
      res.send(result);
    });
    //Get a login user inventory
    app.get("/carServices", async (req, res) => {
      const query = { title: "email" };
      const cursor = serviceCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    //Delete inventory
    app.delete("/carServices/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Mongodb is running!!");
});

app.listen(port, () => {
  console.log("listening to port:", port);
});
