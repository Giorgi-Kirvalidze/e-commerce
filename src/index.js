const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const app = express();

/* db connection */
require("./config/db");

/* Setting/init env environment dinamically */
dotenv.config({
  path: path.resolve(process.cwd() + "/src", `${process.env.NODE_ENV}.env`),
});

/* setting cloudinay for serverles file uploads */
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* Importing routes */
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const cartRoutes = require("./routes/cart");

/* Handling cors */
app.use((_, res, next) => {
  // Set CORS headers so that the React SPA is able to communicate with this server
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

/* Setting parsers */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

/* Defining routes */
app.get("/", (_, res) => res.status(200).send({ message: "server running" }));
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

/* listening to 5000 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running at ${PORT}`));
