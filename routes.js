var express = require('express')
var router = express.Router()
var hash = require('pbkdf2-password')()

var sendMail = require('./mail')

var users = [];
var otp = -1;


// =============
//   Home Page
// =============
router.get('/', function(req, res){
  if(req.session.user){
    res.render("landing", {email: req.session.user.email})
  } else {
    res.render("landing", {email: ""})
  }
});


// ==========
//   Sign Up
// ==========
router.get("/register", function(req,res){
  res.render("register")
})

router.post("/register", function(req,res){
  var email = req.body.username

  var indx = users.findIndex(user => user.email == email)
  if(indx >= 0){
    res.redirect("/login")
  } else {
    hash({ password: req.body.password }, function (err, pass, salt, hash) {
      if (err) console.log(err)
      else{
        req.session.regenerate(function(){
          var user = {email : email, hash: hash, salt:salt}
          req.session.user = user;
          req.session.verify = "true";
          res.redirect("verify")
      });
      }
    });
  }
})


// ==========
//   Verify
// ==========
router.get("/verify", checkRegistration , function(req,res){
  otp = Math.floor(Math.random() * 9000) + 1000;
  sendMail(otp,req.session.user.email)
  res.render("verify")
})
router.post("/verify", function(req,res){
  if(otp == req.body.otp){
    users.push(req.session.user)
    res.redirect("/")
  } else {
    console.log("OTP did not match")
    req.session.destroy(function(){
      res.redirect('/register');
    }); 
  }
})


// ==========
//   Logout
// ==========
router.get('/logout', function(req, res){
  req.session.destroy(function(){
    res.redirect('/');
  });
});


// ==========
//   Login
// ==========
router.get('/login', function(req, res){
  res.render('login');
});

router.post('/login', function (req, res, next) {
  authenticate(req.body.username, req.body.password, function(err, user){
    if (err) return next(err)
    if (user) {
      req.session.regenerate(function(){
        req.session.user = user;
        res.render('landing',{email: user.email});
      });
    } else {
      res.redirect('/login');
    }
  });
});


// =================
//  Restricted Area
// =================
router.get('/restricted', restrict, function(req, res){
  res.render("restricted");
});



// ======================
//   HELPER FUNCTIONS
// ======================

// Middleware : Checks weather users can access restricted page
function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Middleware : Used between Sign Up and Verification
function checkRegistration(req,res,next){
  if (req.session.user) {
    next();
  } else {
    res.redirect('/register');
  }
}

// Authenticate : Checks weather user can login
function authenticate(email, pass, fn) {
  var indx = users.findIndex(user => user.email == email)
  var user = users[indx];
  // query the db for the given username
  if (indx < 0) return fn(null, null)
  hash({ password: pass, salt: user.salt }, function (err, pass, salt, hash) {
    if (err) return fn(err);
    if (hash === user.hash) return fn(null, user)
    fn(null, null)
  });
}

module.exports = router;