import express, { Application } from "express";
import cookieParser from "cookie-parser"
import path from "path";
import { VandorRoute } from "../routes/VandorRoute";
import { AdminRoute } from "../routes/AdminRoute";
import { ShoppingRoute } from "../routes/ShoppingRoute";
import { CustomerRoute } from "../routes/CustomerRoute";

export default async (app: Application) => {
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use("/images", express.static(path.join(__dirname, "images")));

  app.use("/admin", AdminRoute);
  app.use("/vandor", VandorRoute);
  app.use("/customer", CustomerRoute);
  app.use("/shopping", ShoppingRoute);

  return app;
};
