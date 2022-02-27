var express = require('express');
var hash = require('pbkdf2-password')()
var path = require('path');
var session = require('express-session');

var app = module.exports = express();

// config

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// middleware
app.use(express.urlencoded({ extended: false }))
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'shhhh, very secret'
}));

app.use(express.static("public"))

var routes = require('./routes')
app.use("/" , routes)

if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}
