const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://localhost:27017/e-commerce", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true, //ensures fast index creating
});
const db = mongoose.connection;

db.on("error", (error) => console.log({ message: error }));
db.once("open", () => console.log("Database connected"));
