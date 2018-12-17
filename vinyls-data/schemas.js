const { Schema, SchemaTypes: { ObjectId } } = require('mongoose')



const User = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    imgProfileUrl: {
        type: String
    },
    bio: {
        type: String
    },
    followers: [{
        type: ObjectId,
        ref: 'User'
    }],
    follows: [{
        type: ObjectId,
        ref: 'User'
    }],
    connection: {
        type: String,
        required: true,
        default: 'offline'
    }
  
    
})


const Comment = new Schema({
    user: {
        type: ObjectId,
        ref: 'User'
    },
    text: {
        type: String
    },
    username:{
        type: String,
        required: true
    },
    imgProfileUrl: {
        type: String
    }

})



const Vinyl = new Schema({

    id: {
        type: ObjectId,
        ref: 'User'
    },
    
    title: {
        type: String,
        required: true
    },

    artist: {
        type: String,
        required: true
    },

    year: {
        type: String,
        required: true
    },

    imgVinylUrl: {
        type: String,
    },

    info: {
        type: String,
    },

    comments: [Comment],

    likes: [{
        type: ObjectId,
        ref: 'User'
    }]
   

})





module.exports = {   
    User,
    Comment,
    Vinyl
    
}


