const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./routes/user"); 
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const newsletterRoute = require("./routes/newsletter");
const stripeRoute = require("./routes/stripe");
const cors = require("cors");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB Connection successfull"))
  .catch((err) => {
    console.log(err);
  });

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}))

 app.use(cors({origin: "http://localhost:3000", credentials: true}))


 app.use("/api", productRoute);
 app.use("/api", cartRoute);
 app.use("/api/users", userRoute);
 app.use("/api", orderRoute)
 app.use("/api", stripeRoute)
 app.use("/api/auth", authRoute);
 app.use("/api", newsletterRoute);



app.listen(process.env.PORT  || 4000, () => {
  console.log("Backend server is running!");
});
