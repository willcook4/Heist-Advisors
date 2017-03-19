var User = require('../models/user');
var jwt = require('jsonwebtoken');
var secret = require('../config/tokens').secret;

function keys(req, res) {
  console.log('Now handing over keys...');
  return res.status(200).json({
    keys: {
      'client_id': process.env.LUFTHANSA_API_CLIENT_ID,
      'client_secret': process.env.LUFTHANSA_API_CLIENT_SECRET
    }
  });
}

function register(req, res) {
  User.create(req.body, function(err, user) {
    if(err) return res.status(400).json(err);

    var payload = { _id: user._id, username: user.username };
    var token = jwt.sign(payload, secret, { expiresIn: 60*60*24 });

    return res.status(200).json({
      message: 'Registration succesful, let the heists begin!',
      token: token
    });
  });
}

function login(req, res) {
  User.findOne({ email: req.body.email }, function(err, user) {
    if(err) res.send(500).json(err);
    if(!user || !user.validatePassword(req.body.password)) {
      return res.status(401).json({
        message: 'User validation failed',
        name: 'ValidationError',
        errors: {
          email: 'Invalid',
          password: 'Invalid'
        }
      });
    }

    var payload = { _id: user._id, username: user.username };
    var token = jwt.sign(payload, secret, { expiresIn: 60*60*24 });

    return res.status(200).json({
      message: 'Login successful!',
      token: token
    });
  });
}

module.exports = {
  register: register,
  login: login,
  keys: keys
};








