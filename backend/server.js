const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authGuard = require("./middleware/authMiddleware");
const { register, login } = require("./controllers/authController");
const { createJob, getJobs, updateJob, deleteJob } = require("./controllers/jobController");

const app = express();

app.use(cors());

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

app.get("/api/test", (req, res) => {
  res.json({ message: "Workspace Pro backend online." });
});

app.post("/api/auth/register", register);
app.post("/api/auth/login", login);

app.post("/api/jobs", authGuard, createJob);       
app.get("/api/jobs", authGuard, getJobs);         
app.put("/api/jobs/:id", authGuard, updateJob);    
app.delete("/api/jobs/:id", authGuard, deleteJob); 

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const dbOptions = {
  autoIndex: true,                
  serverSelectionTimeoutMS: 5000, 
  socketTimeoutMS: 45000,         
  family: 4                       
};

mongoose
  .connect(MONGO_URI, dbOptions)
  .then(() => {
    console.log(" SUCCESS: Connected to MongoDB Atlas cluster!");
    app.listen(PORT, () => {
      console.log(`Server listening smoothly on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(" DATABASE CONNECTION ERROR:", err.message);
  });