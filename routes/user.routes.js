const path = require('path')
const express = require('express')
const { v4: uuidV4 } = require('uuid')
var bodyParser = require('body-parser')
// importing user context
const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");
const usercontroller = require("../controllers/user.controller");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const auth = require("../middleware/authJwt");
var cookieParser = require('cookie-parser')
const { authJwt } = require("../middleware");



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
    // app.use(function(req, res, next) {
    //   res.header(
    //     "Access-Control-Allow-Headers",
    //     "x-access-token, Origin, Content-Type, Accept"
    //   );
    //   next();
    // });
    // app.get("/welcome", authJwt.verifyToken, (req, res) => {
    //   res.status(200).send("Welcome 🙌 ");
    // });
  
    // app.get("/api/test/all", usercontroller.allAccess);
  
    // app.get(
    //   "/api/test/user",
    //   [authJwt.verifyToken],
    //   usercontroller.userBoard
    // );
  
    // app.get(
    //   "/api/test/mod",
    //   [authJwt.verifyToken, authJwt.isModerator],
    //   usercontroller.moderatorBoard
    // );
  
    // app.get(
    //   "/api/test/admin",
    //   [authJwt.verifyToken, authJwt.isAdmin],
    //   usercontroller.adminBoard
    // );
        
    
   
    // // Login
    // // app.post("/login", async (req, res) => {

    // //     // Our login logic starts here
    //     try {
    //       // Get user input
    //       const { email, password } = req.body;
    //       console.log(req.body);
    //       // Validate user input
    //       if (!(email && password)) {
    //         res.status(400).send("All input is required");
    //       }
    //       // Validate if user exist in our database
    //       const user = await User.findOne({ email });
      
    //       if (user && (await bcrypt.compare(password, user.password))) {
    //         // Create token
    //         const token = jwt.sign(
    //           { user_id: user._id, email },
    //           process.env.TOKEN_KEY,
    //           {
    //             expiresIn: "2h",
    //           }
    //         );
      
    //         // save user token
    //         user.token = token;
    //         res.cookie('x-access-token',token)
    //         // user
    //         res.redirect('/');
    //         //res.status(200).json(user);
    //       }
    //       res.status(400).send("Invalid Credentials");
    //     } catch (err) {
    //       console.log(err);
    //     }
    //     // Our register logic ends here
    //   });
      // app.get('/', (req, res) => {
    //     res.redirect(`/${uuidV4()}`)
    //   })
    app.post("/call", authJwt.verifyToken,function(req, res){
      //this is a callback function
      var username = req.body.username;
      console.log(username);
      var guestuser = req.body.yusername;
      console.log(guestuser);
      //var room = req.body.room;
      res.render('viewer', { roomId: username, guestuser: guestuser })
  })
    
    app.get('/mainroom/:username', authJwt.verifyToken, (req, res) => {
        res.render('mainroom', { roomId: req.params.username })
      })
      
     app.use(express.static(path.join(__dirname, '..','public')))
     app.use(express.static(path.join(__dirname, '..','node_modules')))
}




