const mongoose = require("mongoose")
const UserDb = require("../models/User.model")
const passport = require('passport');
const mailer = require('../config/mailer.config');


// ----------------------- // REGISTER //  ----------------------- //
// router.get('/register', authController.register)
module.exports.register = (req, res, next) => {
  res.render('auth/register' )
}


// router.post('/register', authController.doRegister)
module.exports.doRegister = (req, res, next) => {
  const user = req.body;

  const renderWithErrors = (errors) => {
    res.render('auth/register', { errors, user })
  }

  // MULTER
  //console.log("muulter", req.file)

  UserDb.findOne({ email: user.email })
    .then((userFound) => {
      if (userFound) {
        renderWithErrors({ email: 'Email already in use' })
      } else {  // multer
        if (req.file) {
          user.image = req.file.path
        }
        return UserDb.create(user)
          .then((createdUser) => {
            mailer.sendActivationEmail(createdUser.email, createdUser.activationToken)
            res.redirect('/login')
          })
      }
    })

    // display the errors assigned in the model
    // errors: {name:     ValidatorError: name needs at least 3 chars ....}
    // errors: {password: ValidatorError: password needs at least 8 chars ......
    .catch(err => {
      if (err instanceof mongoose.Error.ValidationError) {
        console.log("errorerererer",err.errors)
        renderWithErrors(err.errors)
      } else {
        next(err)
      }
    })
}
//----------------------- // ACTIVATE ACCOUNT //  ----------------------- //
module.exports.activate = (req, res, next) => {
  const activationToken = req.params.token;

  UserDb.findOneAndUpdate(
    { activationToken, active: false },
    { active: true }
  )
    .then(() => {
      req.flash('flashMessage', 'You have activated your account. Welcome!')
      res.redirect('/login')
    })
    .catch(err => next(err))
}



// ----------------------- // LOGIN //  ----------------------- //
// router.get('/login', authController.login)
module.exports.login = (req, res, next) => {
  res.render('auth/login')
}

const doLogin = (req, res, next, provider = 'local-auth') => {
  passport.authenticate(provider, (err, user, validations) => {
    if (err) {
      next(err)
    } else if(!user) {
      res.status(404).render('auth/login', { errorMessage: validations.error })
    } else {
      req.login(user, (loginError) => {
        console.log({user});
        if (loginError) {
          next(loginError)
        } else {
          req.flash('flashMessage', 'You have succesfully signed in')
          res.redirect('/profile')
        }
      })
    }
  })(req, res, next)
}
// LOG IN LOCAL STRATEGY
module.exports.doLogin = (req, res, next) => {
  doLogin(req, res, next)
}

// LOG IN GOOGLE STRATEGY
module.exports.doLoginGoogle = (req, res, next) => {
  doLogin(req, res, next, 'google-auth')
}



//----------------------- // LOGOUT //  ----------------------- //
module.exports.logout = (req, res, next) => {
  req.logout();
  res.redirect('/login');
}