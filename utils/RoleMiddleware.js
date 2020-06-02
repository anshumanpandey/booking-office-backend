const roleMiddleware = require('express-jwt-permissions')({
  permissionsProperty: 'roleGuards'
})

module.exports = roleMiddleware
