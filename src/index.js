require('dotenv').config();
require('express-async-errors');

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const methodOverride = require("method-override");
const path = require("path");
const bodyParser = require("body-parser");
const cron = require('node-cron');

const { app, server } = require("../src/config/socket");
const syncData = require('./config/cron/syncData');
const connectMongodb = require("../src/config/db/init.mongo");
const errorHandler = require("../src/app/midleware/errorHandler");

const PORT = process.env.PORT || 3001;
const route = require("./routes");

app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");

app.use(morgan("combined"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(methodOverride("_method"));

app.use(errorHandler);

connectMongodb();

//cron.schedule('*/30 * * * *', syncData); 

route(app);

server.listen(PORT);
