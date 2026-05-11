import exp from "express";
import { config } from "dotenv";
import mongoose from "mongoose";
import { userApp } from "./APIs/UserAPI.js";
import { authorApp } from "./APIs/AuthorAPI.js";
import { adminApp } from "./APIs/AdminAPI.js";
import { commonApp } from "./APIs/CommonAPI.js";
import cookieParser from "cookie-parser";
import cors from "cors";

config();

//create express app
const app = exp();

//enable cors
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);

//add cookie parser middleware
app.use(cookieParser());

//body parser middleware
app.use(exp.json());

//path level middlewares
app.use("/user-api", userApp);
app.use("/author-api", authorApp);
app.use("/admin-api", adminApp);
app.use("/auth", commonApp);

//connect to db
const connectDB = async () => {
  try {

    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.DB_URL);

    console.log("DB server connected");

    //assign port
    const port = process.env.PORT || 5000;

    app.listen(port, () => {
      console.log(`server listening on ${port}..`);
    });

  } catch (err) {
    console.log("err in db connect", err);
    process.exit(1);
  }
};

connectDB();

//to handle invalid path
app.use((req, res, next) => {
  console.log(req.url);

  res.status(404).json({
    message: `path ${req.url} is invalid`,
  });
});

//Error handling middleware
app.use((err, req, res, next) => {

  console.log("error is ", err);

  //ValidationError
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "error occurred",
      error: err.message,
    });
  }

  //CastError
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "error occurred",
      error: err.message,
    });
  }

  const errCode =
    err.code ??
    err.cause?.code ??
    err.errorResponse?.code;

  const keyValue =
    err.keyValue ??
    err.cause?.keyValue ??
    err.errorResponse?.keyValue;

  //Duplicate key error
  if (errCode === 11000) {

    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];

    return res.status(409).json({
      message: "error occurred",
      error: `${field} "${value}" already exists`,
    });
  }

  //server side error
  res.status(500).json({
    message: "error occurred",
    error: "Server side error",
  });
});
