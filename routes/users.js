const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

//user model
const User = require("../models/User");

//login page
router.get("/login", (req, res) => res.render("login"));

//register page
router.get("/register", (req, res) => res.render("register"));

// register handle
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];
  //check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "please fill in all fields" });
  }

  //check pass match
  if (password !== password2) {
    errors.push({ msg: "passwords do not match" });
  }

  //check pass length
  if (password.length < 6) {
    errors.push({ msg: "password should be > 6 characters" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    //validation passed
    User.findOne({ email: email }).then(user => {
      //promise
      if (user) {
        //user exists
        errors.push({ msg: "Email is already registered" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });
        console.log(newUser); //delete this later #unsafe
        // has password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            //set pass to hashed
            newUser.password = hash;
            // save user
            newUser
              .save()
              .then(user => {
                req.flash("success_msg", "you are registered and can log in");
                res.redirect("/users/login");
              })
              .catch(err => console.log(err));
          })
        );
      }
    });
  }
});

//login handle
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

//logoit handle
router.get("/logout", (req, res) => {
  req.logOut();
  req.flash("success_msg", "you are logged out");
  res.redirect("/users/login");
});

module.exports = router;
