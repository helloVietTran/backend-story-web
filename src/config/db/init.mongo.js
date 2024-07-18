require('dotenv').config();
const mongoose = require("mongoose");

const databaseUri = process.env.DATABASE_URI;

const connectMongodb = async () => {
    try {
      await mongoose.connect(databaseUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("connected to database");
    } catch (error) {
      console.log("not connected to database", error);
    }
  };
  
  module.exports = connectMongodb;
