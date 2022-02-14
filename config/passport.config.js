const passport = require('passport');
const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const User = require('../models/User.model');

passport.serializeUser((user, next) => {
  next(null, user.id)
})

passport.deserializeUser((id, next) => {
  User.findById(id)
    .then(user => {
      next(null, user)
    })
    .catch(err => next(err))
})

passport.use('local-auth', new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  (email, password, next) => {
    // Comprobar si ya existe un usuario -> comparar la contraseña -> GO
    User.findOne({ email })
      .then((user) => {
        if (!user) {
          next(null, false, { error: 'Email or password are incorrect' })
        } else {
          return user.checkPassword(password)
            .then((match) => {
              if (!match) {
                next(null, false, { error: 'Email or password are incorrect' })
              } 
              // node mailer
              else {
                if (user.active) {
                  next(null, user)
                } else {
                  next(null, false, { error: 'You have to activate your account' })
                }
              }
            })
        }
      })
      .catch(err => next(err))
  }
))

passport.use('google-auth', new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  (accessToken, refreshToken, profile, next) => {
    
    console.log("Google account details:", profile); // to see the structure of the data in received response:

    const googleID = profile.id;
    const name = profile.displayName;
    const email = profile.emails && profile.emails[0].value || undefined
    const image = profile.photos && profile.photos[0].value || undefined

    if (googleID && email) {
      User.findOne({ $or: [            // check if the user email or google Id exists in the db
        { email },
        { googleID }
      ]})
        .then(user => {  
          if (user) {                 // if match : next
            next(null, user)
          } else {                    // if not match : create one and next
            // Crear uno nuevo
            return User.create({
              name,
              email,
              password: mongoose.Types.ObjectId(),// invents a random pw
              googleID,
              image
            })
              .then(userCreated => {
                next(null, userCreated) // return the data to the function => const doLogin = (req, res, next, provider = 'local-auth') => {....

              })
          }
        })
        .catch(err => next(err))
    } else {
      next(null, false, { error: 'Error connecting with Google Auth' })
    }
  }
))