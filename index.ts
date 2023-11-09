import express from "express";
import App from './services/ExpressApp'
import DBConnection from './services/Database'

const StartServer = async () => {

  const app = express()
  await DBConnection()
  await App(app)
  app.listen(5353, () => {
    console.log("Listening on port 5353");
    
  })
}


StartServer()


