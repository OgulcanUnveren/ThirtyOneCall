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
const config = require("../config/auth.config");
const db = require("../models");
const Call = db.call;
const Room = db.room;
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

// parse application/x-www-form-urlencoded

module.exports = (app) => {
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
    
    app.get("/", authJwt.verifyToken, function(req,res,next) {
      jwt.verify(req.cookies['x-access-token'],config.secret , function(err, decodedToken) {
        if(err) { /* handle token err */ }
        else {
          console.log(decodedToken);
          User.findOne({
            where: {
              id: decodedToken.id
            }
          })
          .then(user => {
              if (!user) {
                return res.status(404).send({ message: "User Not found." });
              }
        
              var authorities = [];
              user.getRoles().then(roles => {
                for (let i = 0; i < roles.length; i++) {
                  authorities.push("ROLE_" + roles[i].name.toUpperCase());
                }});
             res.render('streamer',{
                 id: user.id,
                 username: user.username,
                 email: user.email,
                 roles: authorities,
                 accessToken: req.cookies['x-access-token']
               });
            
        });
        }
     });
    });
    app.get("/sockettest",function(req,res){
      socket.emit("")
    })
    app.post("/call", authJwt.verifyToken,function(req, res){
      //this is a callback function
      var username = req.body.username;
      console.log(username);
      var guestuser = req.body.yusername;
      console.log(guestuser);
      
      Call.findOne({
        where: {
          host: username
        }
      })
      .then(call => {
          if (!call) {
            jwt.verify(req.cookies['x-access-token'],config.secret , function(err, decodedToken) {
              if(err) { /* handle token err */ }
              else {
                console.log(decodedToken);
                User.findOne({
                  where: {
                    username: username
                  }
                })
                .then(user => {
                  
                  if (!user) {
                    return res.status(404).send({ message: "User Not found." });
                  }
                })
                User.findOne({
                  where: {
                    id: decodedToken.id
                  }
                })
                .then(user => {
                    if (!user) {
                      return res.status(404).send({ message: "User Not found." });
                    }
              
                    var authorities = [];
                    user.getRoles().then(roles => {
                      for (let i = 0; i < roles.length; i++) {
                        authorities.push("ROLE_" + roles[i].name.toUpperCase());
                      }});
                      Call.create({
                        host: username,
                        guest: user.username
                      })
                      .then(call => {
                        
                      Call.findOne({
                        where: {
                          host: username
                        }
                      })
                      .then(call => {
                          if (!call) {
                            return res.status(500).send({ message: "An error occured." });
                          }
                          res.render('viewer',{
                            roomId:username,
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            roles: authorities,
                            accessToken: req.cookies['x-access-token'],
                            callid: call.id
                           });
                            
                        })
                });
              });
              }
           });
                  
          }
          else{
            return res.status(403).send({ message: "User in call now." });
          }
          
           
        })
        
      //var room = req.body.room;
      
  })
   
    app.post('/mainroom/', authJwt.verifyToken, (req, res) => {
      jwt.verify(req.cookies['x-access-token'],config.secret , function(err, decodedToken) {
        if(err) { /* handle token err */ }
        else {
          console.log(decodedToken);
          User.findOne({
            where: {
              id: decodedToken.id
            }
          })
          .then(user => {
              if (!user) {
                return res.status(404).send({ message: "User Not found." });
              }
        
              var authorities = [];
              user.getRoles().then(roles => {
                for (let i = 0; i < roles.length; i++) {
                  authorities.push("ROLE_" + roles[i].name.toUpperCase());
                }});
             res.render('mainroom',{
                 roomId:user.username,
                 id: user.id,
                 username: user.username,
                 email: user.email,
                 roles: authorities,
                 accessToken: req.cookies['x-access-token']
               });
            
        });
        }
     });
          
      })
      app.get("/getcall/:id",authJwt.verifyToken, (req, res) => { 
          
        var id = req.params.id;
        Call.findOne({
          where: {
            host: id
          }
        })
        .then(call => {
          if (!call) {
            return res.status(500).send({ message: "Anonymous Friend" });
          }
            return res.status(200).send({ message: call.guest });
        
      
        })
      })
      app.get("/onelinkcreateroom",function (req,res) {
        res.render("createroom");
       })
      
    app.post("/onelinkcreateroom",function (req,res) {
       var room = req.body.room
       var password = req.body.password
       var link = uuidV4()
       if(room && password){
          Room.create({
            roomname:room,
            password:password,
            link: link
          }).then(room => {
            //return res.status(200).send({ message: "https:///onelinkroom/"+link+"/"+password });
             res.redirect("/onelinkroom/"+link+"/"+password)
          })
       }
    })
    app.get("/onelinkmain/:room/:password",function (req,res){
      var room = req.params.room
      var password = req.params.password
      Room.findOne({
        where: {
          link: room,
        }
      }).then(roomer => {
        res.render('mainroom',{
          roomId: roomer.roomname,
          id: password,
          username: "Host",



        });
  
      })
      
    }) 
    app.get("/onelinkviewer/:room/:password",function (req,res){
      var room = req.params.room
      var password = req.params.password
      Room.findOne({where: {link : room }})
      .then(roomer => {
        Call.findOne({
          where: {
            host: room
          }
        })
        .then(caller => {
            if (!caller) {
              return res.status(500).send({ message: "An error occured." });
            }
            res.render('viewer',{
              roomId:roomer.roomname,
              id: password,
              username: "You",
              callid: caller.id
             });
              
          })
        
      })
    }) 
    app.get("/onelinkroom/:room/:password",function (req,res){
      var room = req.params.room
      var password = req.params.password
      if(room && password){

        Room.findOne({where: {link : room }})
        .then(roomer => {
          if (!roomer) {
            return res.status(403).send({ message: "No room like  that" });
          }
          Call.findOne({
            where : {
              host:room
            }
          }).then(call => {
            if(!call){
              Call.create({
                host:room,
                guest:"onelink",
              }).then(callers => {
                console.log(callers);
                res.redirect("/onelinkmain"+room+"/"+password)
              })
              
              }
            
              res.redirect("/onelinkviewer/"+room+"/"+password)
          })
        })
      }
    })
    app.get("/delcall/:id" ,authJwt.verifyToken, (req, res) => { 
      var id = req.params.id;
          Call.destroy({
            where: {
            id:id}
          })
          return res.status(200).send({ message: "Deleted successfully" });
      
      })      
     app.use(express.static(path.join(__dirname, '..','public')))
     app.use(express.static(path.join(__dirname, '..','node_modules')))
}




