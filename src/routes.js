const path = require('path')
const express = require('express')
const { v4: uuidV4 } = require('uuid')
var bodyParser = require('body-parser')


// parse application/x-www-form-urlencoded

module.exports = (app) => {
    app.set('views', path.join(__dirname, '../views'));
    app.set('view engine', 'ejs');
    app.use(bodyParser.urlencoded({ extended: false }))

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
    // app.get('/', (req, res) => {
    //     res.redirect(`/${uuidV4()}`)
    //   })
    app.post("/call", function(req, res){
      //this is a callback function
      var username = req.body.username;
      console.log(username);
      var guestuser = req.body.yusername;
      console.log(guestuser);
      //var room = req.body.room;
      res.render('viewer', { roomId: username, guestuser: guestuser })
  })
  
    app.get('/', (req, res) => {
        res.render('streamer')
      })
    app.get('/mainroom/:username', (req, res) => {
        res.render('mainroom', { roomId: req.params.username })
      })
      
     app.use(express.static(path.join(__dirname, '..','public')))
     app.use(express.static(path.join(__dirname, '..','node_modules')))
}