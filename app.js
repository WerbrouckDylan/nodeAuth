const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");

//passport config
require('./config/passport')(passport);

//DB config
const db = require("./config/keys").mongoURI;

//connect to mongo
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("mongodb connected.."))
  .catch(err => console.log());

//middleware

//EJS
app.use(expressLayouts);
app.set("view engine", "ejs");

//bodyparser
app.use(express.urlencoded({ extended: false }));

//express session -- copypasted config that works so no clue why or what
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);
//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//conect flash
app.use(flash());

//global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));

const PORT = process.env.port || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
