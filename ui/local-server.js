const express = require("express");
const path = require("path");
const app = express();
const port = 9999;

app.use(express.static(path.join(__dirname, "dist", "ui", "browser")));

app.set("view engine", "ejs");

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "ui", "browser", "index.html"));
});

app.listen(port, () => {
  console.log("Server is listening on port " + port);
});
