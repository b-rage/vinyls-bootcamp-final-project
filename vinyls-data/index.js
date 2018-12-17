const mongoose = require('mongoose')

const { User, Comment, Vinyl } = require('./schemas')

module.exports = {
    mongoose,
    models: {
        User: mongoose.model('User', User),
        Comment: mongoose.model('Comment', Comment),
        Vinyl: mongoose.model('Vinyl', Vinyl)
        
    }
}
