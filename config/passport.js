const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load User
const User = require('../models/User');

// check if the user exists
module.exports = function(passport) {
  passport.use(
    new LocalStrategy({usernameField: 'email' }, (email, password, done) => {
      // Match User
      User.findOne({email: email })
        .then(user => {
          if(!user){
            return document(null, false, { message: "Email is not registered" });
          }

          bcrypt.compare(password, user.password, (err, isMatch) => {
            if(err) throw err;

            if(isMatch){
              return done(null, user);
            } else {
              return done(null, false, { message: 'Password incorrect' });
            }
          });
        })
        .catch(err => console.log(err));
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
  
};

