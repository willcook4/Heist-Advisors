var dbURIs = {
  test: 'mongodb://localhost/heists-api-test',
  development: 'mongodb://localhost/heists-api',
  production: process.env.MONGODB_URI || 'mongodb://localhost/heists-api'
};

module.exports = function(env) {
  return dbURIs[env];
};