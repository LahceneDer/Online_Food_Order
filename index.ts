import express from "express";
import bodyParser from "body-parser";

import { VandorRoute } from "./routes/VandorRoute";
import { AdminRoute } from "./routes/AdminRoute";
import mongoose, { Mongoose } from "mongoose";
import { MONGO_URI } from "./config";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/admin", AdminRoute);
app.use("/vandor", VandorRoute);

mongoose
  .connect(MONGO_URI)
  .then((result) => {
    console.log("DB connected");
  })
  .catch((err) => console.log(err));

app.listen(5353, () => {
  console.log("app running on port 5353");
});
