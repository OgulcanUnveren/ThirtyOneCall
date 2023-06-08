const path = require('path')
const express = require('express')
const { v4: uuidV4 } = require('uuid')
var bodyParser = require('body-parser')
// importing user context
const User = require("../model/user");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const auth = require("../middleware/auth");
var cookieParser = require('cookie-parser')



// parse application/x-www-form-urlencoded

module.exports = (app) => {
    app.set('views', path.join(__dirname, '../views'));
    app.set('view engine', 'ejs');
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(cookieParser())
// parse application/json
    app.use(bodyParser.json())
    // redirect http traffic to https traffic
    app.use('*', (req, res, next) => {
        if(!req.socket.encrypted){
            console.log('unsecure connection: redirecting..')
            res.redirect('https://' + req.headers.host + req.path)
        } else {
            next()
        }
    })
    // Register
    app.get("/welcome", auth, (req, res) => {
        res.status(200).send("Welcome 🙌 ");
      });
    app.post("/register", async (req, res) => {

        // Our register logic starts here
        try {
          // Get user input
          const { first_name, last_name, email, password } = req.body;
          console.log(req.body);     
          // Validate user input
          if (!(email && password && first_name && last_name)) {
            res.status(400).send("All input is required");
          }
      
          // check if user already exist
          // Validate if user exist in our database
          const oldUser = await User.findOne({ email });
      
          if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
          }
      
          //Encrypt user password
          encryptedPassword = await bcrypt.hash(password, 10);
      
          // Create user in our database
          const user = await User.create({
            first_name,
            last_name,
            email: email.toLowerCase(), // sanitize: convert email to lowercase
            password: encryptedPassword,
          });
      
          // Create token
          const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
              expiresIn: "2h",
            }
          );
          // save user token
          user.token = token;
      
          // return new user
          //res.status(201).json(user);
          res.redirect("/login")
        } catch (err) {
          console.log(err);
        }
        // Our register logic ends here
      });
    app.get("/login",function (req,res) {
         res.render("login");
    }   ) 
    app.get("/register",function (req,res) {
        res.render("register");
   }   ) 
   
    // Login
    app.post("/login", async (req, res) => {

        // Our login logic starts here
        try {
          // Get user input
          const { email, password } = req.body;
          console.log(req.body);
          // Validate user input
          if (!(email && password)) {
            res.status(400).send("All input is required");
          }
          // Validate if user exist in our database
          const user = await User.findOne({ email });
      
          if (user && (await bcrypt.compare(password, user.password))) {
            // Create token
            const token = jwt.sign(
              { user_id: user._id, email },
              process.env.TOKEN_KEY,
              {
                expiresIn: "2h",
              }
            );
      
            // save user token
            user.token = token;
            res.cookie('x-access-token',token)
            // user
            res.redirect('/');
            //res.status(200).json(user);
          }
          res.status(400).send("Invalid Credentials");
        } catch (err) {
          console.log(err);
        }
        // Our register logic ends here
      });
      // app.get('/', (req, res) => {
    //     res.redirect(`/${uuidV4()}`)
    //   })
    app.post("/call", auth,function(req, res){
      //this is a callback function
      var username = req.body.username;
      console.log(username);
      var guestuser = req.body.yusername;
      console.log(guestuser);
      //var room = req.body.room;
      res.render('viewer', { roomId: username, guestuser: guestuser })
  })
  
    app.get('/', auth,(req, res) => {
        res.render('streamer')
      })
    app.get('/mainroom/:username', auth, (req, res) => {
        res.render('mainroom', { roomId: req.params.username })
      })
      
     app.use(express.static(path.join(__dirname, '..','public')))
     app.use(express.static(path.join(__dirname, '..','node_modules')))
}