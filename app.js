const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose'); 
const router = express.Router();

const flash = require('connect-flash');
const session = require('express-session');

// Passport config 
const passport = require('passport');
require('./config/passport')(passport);

const app = express();

// DB COnfig
const db = require('./config/keys').MongoURI;

// Connect to Mongo
mongoose.connect(db, { useNewUrlParser: true })
    .then(() => console.log('|MongoDB Connected|'))
    .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Bodyparser
app.use(express.urlencoded( {extended:false } ));

// Express session
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );

  // passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
  
// Connect FLash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
  });


// Routes 
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));