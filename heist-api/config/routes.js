// create an express router
var router = require('express').Router();

// require jsonwebtoken stuffs
var jwt = require('jsonwebtoken');
var secret = require('../config/tokens').secret;

// require our controller(s)
var authController = require('../controllers/authentications');

// middleware to check for token
function secureRoute(req, res, next) {
  if(!req.headers.authorization) return res.status(401).json({ message: "Unauthorized" });

  var token = req.headers.authorization.replace('Bearer ', '');

  jwt.verify(token, secret, function(err, payload) {
    if(err || !payload) return res.status(401).json({ message: "Unauthorized" });

    req.user = payload;
    next();
  });
}

// hook up our controller methods to urls/paths
router.post('/register', authController.register);
router.post('/login', authController.login);

// export the router
module.exports = router;





