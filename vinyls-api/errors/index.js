const AlreadyExistsError = require('./already-exists-error')
const AuthError = require('./auth-error')
const NotFoundError = require('./not-found-error')
const ValueError = require('./value-error')
const NotAllowedError = require('./not-allowed-error')

module.exports = {
    AlreadyExistsError,
    AuthError,
    NotFoundError,
    ValueError,
    NotAllowedError
}