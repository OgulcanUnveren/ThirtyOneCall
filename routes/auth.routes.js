const path = require('path')
const express = require('express')
const { v4: uuidV4 } = require('uuid')
var bodyParser = require('body-parser')
// importing user context
const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");
const usercontroller = require("../controllers/auth.controller");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const auth = require("../middleware/authJwt");
var cookieParser = require('cookie-parser')
const { authJwt } = require("../middleware");

module.exports = function(app) {
  app.set('views', path.join(__dirname, '../views'));
    app.set('view engine', 'ejs');
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(cookieParser())
// parse application/json
    app.use(bodyParser.json())
    // redirect http traffic to https traffic
    // app.use('*', (req, res, next) => {
    //     if(!req.socket.encrypted){
    //         console.log('unsecure connection: redirecting..')
    //         res.redirect('https://' + req.headers.host + req.path)
    //     } else {
    //         next()
    //     }
    // })
    
  
  app.get("/login",function (req,res) {
    res.render("login");
}   ) 
  app.get("/register",function (req,res) {
   res.render("register");
}   ) 

  app.post(
    "/register",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted
    ],
    controller.signup
  );

  app.post("/login", controller.signin);
};
