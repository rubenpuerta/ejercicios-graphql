const express = require("express");
const graphlHTTP = require("express-graphql");
const schema = require("./schema/schema");
const mongoose = require("mongoose");
const auth = require("./utils/auth");

const app = express();

mongoose
  .connect("mongodb://localhost/courseDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => console.log("Conectado a MongoDB correctamente 🔥"))
  .catch(err => console.log("No se ha conectado a MongoDB"));

app.use(auth.checkToken);

app.use(
  "/graphql",
  graphlHTTP(req => {
    return {
      schema,
      context: {
        user: req.user
      }
    };
  })
);

const port = 5000;

app.listen(port, () => console.log(`Server running on port ${port} 🔥`));
