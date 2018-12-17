'use strict'

const { models: { User, Comment, Vinyl } } = require('vinyls-data')
const { env: { PORT } } = process
const { AlreadyExistsError, AuthError, NotFoundError, ValueError, NotAllowedError } = require('../errors')
const validate = require('../utils/validate')
var cloudinary = require('cloudinary')

cloudinary.config({
    cloud_name: 'dmp64syaz',
    api_key: '996161994316851',
    api_secret: 'sd-iBjgcS3aMoRTUU2xnMyb0VKA'
})

const logic = {


    /**
     * Register User
     * @param {string} email The user email
     * @param {string} username The user username
     * @param {string} password The user password
     *  
     * @throws {TypeError} On non-string email or username or password 
     * @throws {Error} On empty or blank email, username, password
     * @throws {AlreadyExistsError} On already exist username
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    registerUser(email, username, password ) {

        validate([{ key: 'email', value: email, type: String }, { key: 'username', value: username, type: String }, { key: 'password', value: password, type: String }])

        return (async () => {
            let user = await User.findOne({ username })

            if (user) throw new AlreadyExistsError(`username ${username} already registered`)

            user = new User({email, username, password })

            await user.save()
        })()
    },



    /**
     * Authenticate User
     * 
     * @param {string} username The user username
     * @param {string} password The user password
     *  
     * @throws {TypeError} On non-string username or password 
     * @throws {Error} On empty or blank username, password
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    authenticateUser(username, password) {

        validate([{ key: 'username', value: username, type: String }, { key: 'password', value: password, type: String }])

        return (async () => {
            const user = await User.findOne({ username })


            if (!user || user.password !== password) throw new AuthError('invalid username or password')


            return user.id
        })()
    },



    /**
     * Add Profile Picture
     * 
     * @param {string} userId The current user id
     * @param {string} file The picture
     *  
     * @throws {TypeError} On non-string user id
     * @throws {Error} On empty or blank user id
     * @throws {NotFoundError} On user not found
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    addProfilePicture(userId, file) {
        validate([
            { key: 'userId', value: userId, type: String },

        ])

        return (async () => {
            let user = await User.findById(userId)

            if (!user) throw new NotFoundError(`user does not exist`)

            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream((result, error) => {
                    if (error) return reject(error)

                    resolve(result)
                })

                file.pipe(stream)
            })
            
            user.imgProfileUrl = result.url


            await user.save()


        })()
    },

    /**
     * Retrieve user by id
     * 
     * @param {string} id The user id
     *  
     * @throws {TypeError} On non-string user id
     * @throws {Error} On empty or blank user id
     * @throws {NotFoundError} On user not found
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    retrieveUser(id) {

        validate([{ key: 'id', value: id, type: String }])

        return (async () => {


            const user = await User.findById(id, { '_id': 0, password: 0, __v: 0 }).lean()


            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            user.idUser = id

            return user
        })()
    },



     /**
     * Retrieve users of gallery by current user id
     * 
     * @param {string} id The current user id
     *  
     * @throws {TypeError} On non-string id
     * @throws {Error} On empty or blank id
     * @throws {NotFoundError} On users not found
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    retrieveGalleryUsers(id) {

        validate([{ key: 'id', value: id, type: String }])

        return (async () => {
            const users = await User.find().lean()

            const _users = users.filter( _index => _index._id != id )

            _users.forEach(user => {

                user.idUser = user._id
                delete user._id
                delete user.__v
                delete user.password

                return user

            })

            const galleryusers = _users.sort(function() {return 0.5 - Math.random()}).slice(0, 8)

            return galleryusers

        })()
    },


     /**
     * Retrieve all users
     * 
     * @throws {NotFoundError} On users not found
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    retrieveUsers() {
      
        return (async () => {
            const users = await User.find().lean()

            users.forEach(user => {

                user.idUser = user._id
                delete user._id
                delete user.__v
                delete user.password

                return user

            })

            return users

        })()
    },


    /**
     * Update User
     * 
     * @param {string} id The user id
     * @param {string} username The user username
     * @param {string} password The user password
     * @param {string} newPassword The user newPassword
     * @param {string} imgProfileUrl The user image profile url
     *  
     * @throws {TypeError} On non-string id, username, password, newPassword, imgProfileUrl
     * @throws {Error} On empty or blank id, username, password, newPassword, imgProfileUrl
     * @throws {NotFoundError} On user not found
     * @throws {AuthError} On password invalid
     * @throws {AlreadyExistsError} On already exist username
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    updateUser(id, username, password, newPassword, imgProfileUrl, bio) {

        validate([
            { key: 'id', value: id, type: String },
            { key: 'username', value: username, type: String },
            { key: 'password', value: password, type: String },
            { key: 'newPassword', value: newPassword, type: String, optional: true },
            { key: 'imgProfileUrl', value: imgProfileUrl, type: String, optional: true }           
        ])

        return (async () => {
            const user = await User.findById(id)

            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            if (user.password !== password) throw new AuthError('invalid password')

            if (username) {
                const _user = await User.findOne({ username })

                if (_user && _user.username != user.username) throw new AlreadyExistsError(`username ${username} already exists`)
  
                user.username = username
                user.password= password
                newPassword != null && (user.password = newPassword)
                user.imgProfileUrl = imgProfileUrl
                user.bio = bio || ''
               
                await user.save()
            } else {
    
                newPassword != null && (user.password = newPassword)

                await user.save()
            }
        })()
    },


    /**
     * Search Users
     * 
     * @param {string} query The query of a search box
     *  
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    searchUsers(query) {

        validate([{ key: 'query', value: query, type: String, optional: true  }])

        
        return (async () => {
            

            const users = await User.find({ username: { $regex: query, $options: 'i' } }).lean()

            users.forEach(user => {

                user.idUser = user._id
                delete user._id
                delete user.__v
                delete user.password

                return user

            })
            
            return users
            
        })()

    },


    /**
     * Add Follow
     * 
     * @param {string} id The current user id
     * @param {string} followUsername The username of user that current user follows
     *  
     * @throws {TypeError} On non-string id
     * @throws {Error} On empty or blank id
     * @throws {NotFoundError} On user id or username of follow not found
     * @throws {ValueError} On username of follow is empty or blank
     * @throws {NotAllowedError} On current user can't follow himself
     * @throws {AlreadyExistsError} On already follow this user
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    addFollow(id, followUsername) {

        validate([{ key: 'id', value: id, type: String }])

        if (followUsername != null && !followUsername.trim().length) throw new ValueError('followUsername is empty or blank')

        return (async () => {
            const user = await User.findById(id)

            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            const follow = await User.findOne({ username: followUsername })

            // if (!follow) throw new NotFoundError(`user with username ${followUsername} not found`)

            if (user.id === follow.id) throw new NotAllowedError('user cannot follow himself')
            
            user.follows.forEach(_followId => {
                
                if (_followId == follow.id) throw new AlreadyExistsError(`already follow this user`)
            })

            follow.followers.forEach(_followersId => {
                
                if (_followersId == id) throw new AlreadyExistsError(`already follow this user`)
            })


            user.follows.push(follow.id)
            follow.followers.push(id)


            await user.save()
            await follow.save()

        })()

    },


    /**
     * Remove Follow
     * 
     * @param {string} id The current user id
     * @param {string} followUsername The username of user that current user follows
     *  
     * @throws {TypeError} On non-string id
     * @throws {Error} On empty or blank id
     * @throws {NotFoundError} On user id or username of follow not found
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    removeFollow(id, followUsername) {

        validate([{ key: 'id', value: id, type: String }, { key: 'followUsername', value: followUsername, type: String }])
    
        return (async () => {
            const user = await User.findById(id)

            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            const follow = await User.findOne({ username: followUsername })

            if (!follow) throw new NotFoundError(`user with username ${followUsername} not found`)

            const index = user.follows.findIndex(_index => {
                return _index == follow.id
            })

            const index2 = follow.followers.findIndex(_index => {
                return _index == id
            })

            user.follows.splice(index,1)
            follow.followers.splice(index2,1)

            await user.save()
            await follow.save()
        })()

    },


    /**
     * Is Follow?
     * 
     * @param {string} id The id of user
     *  
     * @throws {TypeError} On non-string id
     * @throws {Error} On empty or blank id
     * @throws {NotFoundError} On user id not found
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    isFollows(id) {

        validate([{ key: 'id', value: id, type: String }])
 
        return (async () => {
            const user = await User.findById(id)

            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            const follows = user.follows
            
            return follows
            
        })()

    },


    /**
     * Retrieve Follows
     * 
     * @param {string} id The current user id
     *  
     * @throws {TypeError} On non-string id
     * @throws {Error} On empty or blank id
     * @throws {NotFoundError} On user id not found
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    retrieveListFollows(id) {

        validate([{ key: 'id', value: id, type: String }])


        return (async () => {
            const user = await User.findById(id)

            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            const follows = user.follows

            const listFollows = await User.find({
                '_id': { $in: follows}
            }, function(err, docs){
                return docs
            }).lean()

            listFollows.forEach(user => {

                user.idUser = user._id
                delete user._id
                delete user.__v
                delete user.password

                return user
            })
            
            return listFollows

        })()

    },

     /**
     * Retrieve vinyls of followees
     * 
     * @param {string} id The current user id
     *  
     * @throws {TypeError} On non-string id
     * @throws {Error} On empty or blank id
     * @throws {NotFoundError} On user id not found
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    retrieveVinylsFollowees(id) {

        validate([{ key: 'id', value: id, type: String }])


        return (async () => {
            const user = await User.findById(id)

            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            const follows = user.follows

            const listVinylsFollowees = await Vinyl.find({
                'id': { $in: follows}
            }, function(err, docs){
                return docs
            }).lean()


            listVinylsFollowees.forEach(vinyl => {

                vinyl.idVinyl = vinyl._id

                delete vinyl._id
                delete vinyl.__v

                return vinyl

            })
            
            return listVinylsFollowees



        })()

    },


    /**
     * Retrieve followers
     * 
     * @param {string} id The current user id
     *  
     * @throws {TypeError} On non-string id
     * @throws {Error} On empty or blank id
     * @throws {NotFoundError} On user id not found
     * @throws {ValueError} On user id empty or blank
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    retrieveListFollowers(id) {

        validate([{ key: 'id', value: id, type: String }])

        return (async () => {

            const user = await User.findById(id)

            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            const followers = user.followers

            const listFollowers = await User.find({
                '_id': { $in: followers}
            }, function(err, docs){
                return docs
            }).lean()

            listFollowers.forEach(user => {

                user.idUser = user._id
                delete user._id
                delete user.__v
                delete user.password

                return user
            })
            
            return listFollowers

        })()

    },


    /**
     * Adds a vinyl
     * @param {string} id The user id
     * @param {string} title The vinyl title
     * @param {string} artist The vinyl artist
     * @param {string} year The year of vinyl
     * @param {string} info The vinyl info
     * @param {string} imgVinylUrl The vinyl image url
     *
     * 
     * @throws {TypeError} On non-string id, title, artist, year, imgVinylUrl, info
     * @throws {Error} On empty or blank id, title, artist, year, imgVinylUrl, info
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */
    addVinyl(id, title, artist, year, imgVinylUrl, info ) {

        validate([
            { key: 'id', value: id, type: String },
            { key: 'title', value: title, type: String },
            { key: 'artist', value: artist, type: String },
            { key: 'year', value: year, type: String },
            { key: 'imgVinylUrl', value: imgVinylUrl, type: String, optional: true }           
        ])
  

        return (async () => {
            const user = await User.findById(id)

            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            const vinyl = new Vinyl({ id: user.id, title, artist, year, imgVinylUrl, info  })

            vinyl.info = info || ''

            await vinyl.save()

            const idVinyl = vinyl._id

            return idVinyl
        })()
    },


    /**
     * Add Vinyl Picture
     * 
     * @param {string} id The vinyl id
     * @param {string} file The picture
     *  
     * @throws {TypeError} On non-string vinyl id
     * @throws {Error} On empty or blank vinyl id
     * @throws {NotFoundError} On vinyl not found
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    addVinylPicture(file, id) {

        validate([{ key: 'id', value: id, type: String }])

        return (async () => {

            let vinyl = await Vinyl.findById(id)

            if (!vinyl) throw new NotFoundError(`vinyl does not exist`)

            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream((result, error) => {
                    if (error) return reject(error)

                    resolve(result)
                })

                file.pipe(stream)
            })

            vinyl.imgVinylUrl = result.url


            await vinyl.save()
            
        })()
    },


    /**
     * Retrieve all vinyls
     * 
     * @throws {NotFoundError} On vinyls not found
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    retrieveVinyls() {
      
        return (async () => {
            const vinyls = await Vinyl.find().lean()

            vinyls.forEach(vinyl => {

                vinyl.idVinyl = vinyl._id

                delete vinyl._id
                delete vinyl.__v

                return vinyl

            })

            const _vinyls = vinyls.reverse()

            return _vinyls

        })()
    },


    /**
     * Retrieve Vinyl by id
     * 
     * @param {string} id The vinyl id
     *  
     * @throws {TypeError} On non-string vinyl id
     * @throws {Error} On empty or blank vinyl id
     * @throws {NotFoundError} On vinyl not found
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    retrieveVinylById(id) {

        validate([{ key: 'id', value: id, type: String }])

        return (async () => {

            const vinyl = await Vinyl.findById(id, { '_id': 0,  __v: 0 }).lean()

            if (!vinyl) throw new NotFoundError(`vinyl with id ${id} not found`)

            const comments = vinyl.comments

            comments.forEach(comment => {

                comment.idComment = comment._id

                delete comment._id
                delete comment.__v

                return comment

            })

            vinyl.idVinyl = vinyl._id

            delete vinyl._id
            delete vinyl.__v

            return vinyl

        })()
    },


   /**
     * Retrieve Vinyl by user id
     * 
     * @param {string} id The user id
     *  
     * @throws {TypeError} On non-string user id
     * @throws {Error} On empty or blank user id
     * @throws {NotFoundError} On user not found
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    retrieveVinylsByUserId(id) {

        validate([{ key: 'id', value: id, type: String }])

        return (async () => {

            const vinyls = await Vinyl.find({id: id}).lean()

            if (!vinyls) throw new NotFoundError(`vinyls with user id ${id} not found`)

            vinyls.forEach(vinyl => {

                vinyl.idVinyl = vinyl._id

                delete vinyl._id
                delete vinyl.__v

                return vinyl

            })

            return vinyls

        })()
    },


    /**
     * Search Vinyls
     * 
     * @param {string} query The query of a search box
     *  
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    searchVinyls(query) {

        validate([{ key: 'query', value: query, type: String, optional: true }])

        
        return (async () => {
            
            const vinyls = await Vinyl.find({ title: { $regex: query, $options: 'i' } }).lean()

            vinyls.forEach(vinyl => {

                vinyl.idVinyl = vinyl._id
                delete vinyl._id
                delete vinyl.__v

                return vinyl

            })
            
            return vinyls
            
        })()

    },


    /**
     * Remove Vinyl
     * 
     * @param {string} id The vinyl id
     *  
     * @throws {TypeError} On non-string id
     * @throws {Error} On empty or blank id
     * @throws {NotFoundError} On vinyl id not found
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    removeVinyl(id) {

        validate([{ key: 'id', value: id, type: String }])

        return (async () => {
            const vinyl = await Vinyl.findById(id)

            if (!vinyl) throw new NotFoundError(`vinyl with id ${id} not found`)

            await vinyl.remove()
        })()
    },


    /**
     * Update Vinyl
     * 
     * @param {string} id The user id
     * @param {string} title The vinyl title
     * @param {string} artist The vinyl artist 
     * @param {string} year The vinyl year
     * @param {string} imgVinylUrl The vinyl image url
     * @param {string} info The vinyl info
     *  
     * @throws {TypeError} On non-string id, title, artist, year, imgVinylUrl, info 
     * @throws {Error} On empty or blank id, title, artist, year, imgVinylUrl, info 
     * @throws {NotFoundError} On vinyl not found
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    editVinyl(id, title, artist, year, imgVinylUrl, info ) {

        validate([
            { key: 'id', value: id, type: String },
            { key: 'title', value: title, type: String },
            { key: 'artist', value: artist, type: String },
            { key: 'year', value: year, type: String },
            { key: 'imgVinylUrl', value: imgVinylUrl, type: String, optional: true }           
        ])
  
        return (async () => {

            const vinyl = await Vinyl.findById(id)

            if (!vinyl) throw new NotFoundError(`vinyl with id ${id} not found`)

            vinyl.title = title
            vinyl.artist = artist
            vinyl.year = year
            vinyl.imgVinylUrl = imgVinylUrl
            vinyl.info = info || ''
        
            await vinyl.save()
        })()
    },


     /**
     * Add Like to Vinyl
     * 
     * @param {string} id The vinyl id
     * @param {string} userId The id of the current user
     *  
     * @throws {TypeError} On non-string id or user id
     * @throws {Error} On empty or blank id or user id
     * @throws {NotFoundError} On vinyl id or user id not found
     * @throws {AlreadyExistsError} On already like this vinyl
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    addLikeToVinyl(id, userId) {

        validate([{ key: 'id', value: id, type: String }])
        validate([{ key: 'userId', value: userId, type: String }])

        return (async () => {

            const vinyl = await Vinyl.findById(id)

            if (!vinyl) throw new NotFoundError(`vinyl with id ${id} not found`)

            if (!userId) throw new NotFoundError(`user with id ${userId} not found`)
            
            vinyl.likes.forEach(_id => {
                
                if (_id == userId) throw new AlreadyExistsError(`already likes this vinyl`)
            })

            vinyl.likes.push(userId)

            await vinyl.save()

        })()

    },


    /**
     * Remove Like to Vinyl
     * 
     * @param {string} id The vinyl id
     * @param {string} userId The id of the current user
     *  
     * @throws {TypeError} On non-string id or user id
     * @throws {Error} On empty or blank id or user id
     * @throws {NotFoundError} On vinyl id or user id not found
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    removeLikeToVinyl(id, userId) {

        validate([{ key: 'id', value: id, type: String }])
        validate([{ key: 'userId', value: userId, type: String }])

        return (async () => {

            const vinyl = await Vinyl.findById(id)

            if (!vinyl) throw new NotFoundError(`vinyl with id ${id} not found`)

            if (!userId) throw new NotFoundError(`user with id ${userId} not found`)

            let _likes = vinyl.likes

            const __likes = _likes.filter(el => {
                return el != userId
                })
                
            vinyl.likes = __likes

            await vinyl.save()

        })()

    },


    /**
     * is Like?
     * 
     * @param {string} id The vinyl id
     *  
     * @throws {TypeError} On non-string id 
     * @throws {Error} On empty or blank id 
     * @throws {NotFoundError} On vinyl id not found
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    isLikes(id) {

        validate([{ key: 'id', value: id, type: String }])
 
        return (async () => {
            const vinyl = await Vinyl.findById(id)

            if (!vinyl) throw new NotFoundError(`vinyl with id ${id} not found`)

            const likes = vinyl.likes

            return likes
            
        })()

    },

    /**
     * Add comment to Vinyl
     * 
     * @param {string} id The vinyl id
     * @param {string} userId The id of the current user
     * @param {string} text The comment text
     *  
     * @throws {TypeError} On non-string id or user id or text
     * @throws {Error} On empty or blank id or user id or text
     * @throws {NotFoundError} On user id not found
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    addCommentToVinyl(vinylId, userId, text) {

        validate([
            { key: 'vinylId', value: vinylId, type: String },
            { key: 'text', value: text, type: String },
            { key: 'userId', value: userId, type: String }         
        ])
  

        return (async () => {
            const _user = await User.findById(userId).lean()

            if (!_user) throw new NotFoundError(`user with id ${userId} not found`)

            const username = _user.username
            const imgProfileUrl = _user.imgProfileUrl
            const user = userId

            const comment = new Comment({ user, text, username, imgProfileUrl })

            const vinyl = await Vinyl.findById(vinylId)

            vinyl.comments.push(comment)

            await vinyl.save()
        })()
    },


    /**
     * Retrieve commentS of Vinyl
     * 
     * @param {string} id The vinyl id
     *  
     * @throws {TypeError} On non-string id 
     * @throws {Error} On empty or blank id 
     * @throws {NotFoundError} On vinyl id not found
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    retrieveVinylComments(id) {

        validate([{ key: 'id', value: id, type: String }])

        return (async () => {

            const vinyl = await Vinyl.findById(id, { '_id': 0,  __v: 0 }).lean()

            if (!vinyl) throw new NotFoundError(`vinyl with id ${id} not found`)

            const comments = vinyl.comments

            comments.forEach(comment => {

                comment.idComment = comment._id

                delete comment._id
                delete comment.__v

                return comment

            })

            return comments

        })()

    },

    /**
     * Retrieve user favourites Vinyls
     * 
     * @param {string} id The user id
     *  
     * @throws {TypeError} On non-string id or userId
     * @throws {Error} On empty or blank id id or userId
     * @throws {NotFoundError} On vinyl id not found
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    retrieveUserFavouritesVinyls(id) {


        validate([{ key: 'id', value: id, type: String }])

        return (async () => {


            const _vinyls =  await Vinyl.find( { likes : { $elemMatch :  { $eq: id } } } ).lean()

            if (!id) throw new NotFoundError(`user with id ${userId} not found`)
    
            
            _vinyls.forEach(vinyl => {

                vinyl.idVinyl = vinyl._id
                delete vinyl._id
                delete vinyl.__v

                return vinyl

            })
            
            return _vinyls

        })()

    },

           /**
     * Connected User
     * 
     * @param {string} id The user id

     *  
     * @throws {TypeError} On non-string id 
     * @throws {Error} On empty or blank id
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    connectedUser(id, connected) {

        validate([{ key: 'id', value: id, type: String }])
        validate([{ key: 'connected', value: connected, type: String }])

        return (async () => {

            let user = await User.findById(id)

            if (!user) throw new NotFoundError(`user does not exist`)

            user.connection = connected 

            await user.save()

            
        })()
    },

    /**
     * Disconnected User
     * 
     * @param {string} id The user id
     *  
     * @throws {TypeError} On non-string id 
     * @throws {Error} On empty or blank id
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    disconnectedUser(id, connected) {

        validate([{ key: 'id', value: id, type: String }])
        validate([{ key: 'connected', value: connected, type: String }])

        return (async () => {
            const user = await User.findOne({ _id: id })

            if (!user) throw new NotFoundError(`user does not exist`)

            user.connection = connected

            await user.save()
        })()
    }




}

module.exports = logic