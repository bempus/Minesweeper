const express = require("express");

const app = express();

app.use(express.static(__dirname + "/static"));

app.listen(process.env.PORT || 3000);
