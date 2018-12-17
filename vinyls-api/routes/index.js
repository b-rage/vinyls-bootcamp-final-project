const express = require('express')
const bodyParser = require('body-parser')
const logic = require('../logic')
const jwt = require('jsonwebtoken')
const bearerTokenParser = require('../utils/bearer-token-parser')
const jwtVerifier = require('./jwt-verifier')
const routeHandler = require('./route-handler')
const Busboy = require('busboy')

const jsonBodyParser = bodyParser.json()

const router = express.Router()

const { env: { JWT_SECRET } } = process


// USERS

router.post('/users', jsonBodyParser, (req, res) => {
    routeHandler(() => {
        const { email, username, password } = req.body

        return logic.registerUser(email, username, password )
            .then(() => {
                res.status(201)

                res.json({
                    message: `${username} successfully registered`
                })
            })
    }, res)
})

router.post('/auth', jsonBodyParser, (req, res) => {
    routeHandler(() => {
        const { username, password } = req.body

        return logic.authenticateUser(username, password)
            .then(id => {
                const token = jwt.sign({ sub: id }, JWT_SECRET)

                res.json({
                    data: {
                        id,
                        token
                    }
                })
            })
    }, res)
})


router.get('/users/:id', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { params: { id }, sub } = req

        return logic.retrieveUser(id)
            .then(user =>
                res.json({
                    data: user
                })
            )
    }, res)
})



router.post('/users/:id/profilePicture', [bearerTokenParser, jwtVerifier, jsonBodyParser], (req, res) => {
    routeHandler(() => {
        const { params: { id }, sub } = req
        if (id !== sub) throw Error('token sub does not match user id')

        return new Promise((resolve, reject) => {
            const busboy = new Busboy({ headers: req.headers })

            busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
                logic.addProfilePicture(id, file)
            })

            busboy.on('finish', () => resolve())

            busboy.on('error', err => reject(err))

            req.pipe(busboy)
        })
            .then(() => res.json({
                message: 'photo uploaded'
            }))
    }, res)
})



router.get('/users', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {

        return logic.retrieveUsers()
            .then(users =>
                res.json({
                    data: users
                })
            )
    }, res)
})

router.get('/users/user/:id', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {

        const { params: { id }, sub } = req

        return logic.retrieveGalleryUsers(id)
            .then(users =>
                res.json({
                    data: users
                })
            )
    }, res)
})

router.patch('/users/:id', [bearerTokenParser, jwtVerifier, jsonBodyParser], (req, res) => {
    routeHandler(() => {
        const { params: { id }, sub, body: { username, password, newPassword, imgProfileUrl, bio } } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.updateUser(id, username, password, newPassword ? newPassword : null, imgProfileUrl ? imgProfileUrl : null, bio ? bio : null )
            .then(() =>
                res.json({
                    message: 'user updated'
                })
            )
    }, res)
})

router.patch('/users/:id/follows', [bearerTokenParser, jwtVerifier, jsonBodyParser], (req, res) => {
    routeHandler(() => {
        const { params: { id }, sub, body: { followUsername } } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.addFollow(id, followUsername)
            .then(() =>
                res.json({
                    message: 'follow added'
                })
            )
    }, res)
})

router.delete('/users/:id/follows', [bearerTokenParser, jwtVerifier, jsonBodyParser], (req, res) => {
    routeHandler(() => {
        const { params: { id }, sub, body: { followUsername } } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.removeFollow(id, followUsername)
            .then(() =>
                res.json({
                    message: 'follow removed'
                })
            )
    }, res)
})

router.get('/users/:id/follows', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { params: { id }, sub } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.isFollows(id)
            .then(follows => res.json({
                data: follows
            }))
            
    }, res)
})

router.get('/users/:id/followsList', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { params: { id }, sub } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.retrieveListFollows(id)
            .then(listFollows => res.json({

                data: listFollows
            }))
            
    }, res)
})

router.get('/users/:id/followersList', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { params: { id }, sub } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.retrieveListFollowers(id)
            .then(listFollowers => res.json({

                data: listFollowers
            }))
            
    }, res)
})

router.get('/users/:id/followeesVinyls', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { params: { id }, sub } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.retrieveVinylsFollowees(id)
            .then(listVinylsFollowees => res.json({

                data: listVinylsFollowees
            }))
            
    }, res)
})





router.get(`/users/search/:query`, [bearerTokenParser, jwtVerifier], (req, res) => {

    routeHandler(() => {
        const { params: { query }, sub } = req

        return logic.searchUsers(query)
            .then(users =>
                res.json({
                    data: users
                })
            )
    }, res)
})



// VINYLS

router.post('/vinyls', [bearerTokenParser, jwtVerifier, jsonBodyParser], (req, res) => {
    routeHandler(() => {

        const  { id, title, artist, year, imgVinylUrl, info }  = req.body

        return logic.addVinyl( id, title, artist, year, imgVinylUrl, info )
            .then(idVinyl => res.json({

                data: idVinyl
            }))

    }, res)
})

router.post('/vinyls/:id/image', [bearerTokenParser, jwtVerifier, jsonBodyParser], (req, res) => {
    routeHandler(() => {

        const { params: { id } } = req

        return new Promise((resolve, reject) => {
            const busboy = new Busboy({ headers: req.headers })

            busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
                return logic.addVinylPicture(file, id)
            })

            busboy.on('finish', () => resolve())

            busboy.on('error', err => reject(err))

            req.pipe(busboy)
        })
            .then(url => res.json({

                data: 'photo uploaded'  
            }))
    }, res)
})


router.get('/vinyls', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {

        return logic.retrieveVinyls()
            .then(vinyls => res.json({
                data: vinyls
            }))

    }, res)
})

router.get('/vinyls/:id', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        
        const { params: { id } } = req

        return logic.retrieveVinylById(id)
            .then(vinyl => res.json({
                data: vinyl
            }))
    }, res)
})

router.get('/vinyls/user/:id', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        
        const { params: { id } } = req

        return logic.retrieveVinylsByUserId(id)
            .then(vinyls => res.json({
                data: vinyls
            }))
    }, res)
})

router.get(`/vinyls/search/:query`, [bearerTokenParser, jwtVerifier], (req, res) => {

    routeHandler(() => {
        const { params: { query }, sub } = req

        return logic.searchVinyls(query)
            .then(vinyls =>
                res.json({
                    data: vinyls
                })
            )
    }, res)
})

router.delete('/vinyls/:id', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        
        const { params: { id } } = req

        return logic.removeVinyl(id)
            .then(() => res.json({
                message: 'vinyl removed'
            }))
    }, res)
})

router.patch('/vinyls/:id/edit', [bearerTokenParser, jwtVerifier, jsonBodyParser], (req, res) => {
    routeHandler(() => {

        const { params: { id }, sub, body: { title, artist, year, imgVinylUrl, info}} = req

        return logic.editVinyl( id, title, artist, year, imgVinylUrl, info )
            .then(() => res.json({
                message: 'vinyl updated'
            }))

    }, res)
})

router.patch('/vinyls/:id/likes', [bearerTokenParser, jwtVerifier, jsonBodyParser], (req, res) => {
    routeHandler(() => {
        const { params: { id }, sub, body: { userId } } = req

        if (userId !== sub) throw Error('token sub does not match user id')

        return logic.addLikeToVinyl(id, userId)
            .then(() =>
                res.json({
                    message: 'like added'
                })
            )
    }, res)
})


router.delete('/vinyls/:id/likes', [bearerTokenParser, jwtVerifier, jsonBodyParser], (req, res) => {
    routeHandler(() => {
        
        const { params: { id }, sub, body: { userId } } = req
        
        if (userId !== sub) throw Error('token sub does not match user id')

        return logic.removeLikeToVinyl(id, userId)
            .then(() => res.json({
                message: 'like removed'
            }))
    }, res)
})


router.get('/vinyls/:id/likes', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        
        const { params: { id } } = req

        return logic.isLikes(id)
            .then(likes => res.json({
                data: likes
            }))
    }, res)
})

router.patch('/vinyls/:id/comments', [bearerTokenParser, jwtVerifier, jsonBodyParser], (req, res) => {
    routeHandler(() => {
        const { params: { id }, sub, body: { userId, text } } = req

        if (userId !== sub) throw Error('token sub does not match user id')

        return logic.addCommentToVinyl(id, userId, text)
            .then(() =>
                res.json({
                    message: 'comment added'
                })
            )
    }, res)
})


router.get('/vinyls/:id/comments', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        
        const { params: { id } } = req

        return logic.retrieveVinylComments(id)
            .then(comments => res.json({
                data: comments
            }))
    }, res)
})


router.get('/vinyls/user/:id/favourites', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { params: { id }, sub } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.retrieveUserFavouritesVinyls(id)
            .then(favouritesVinyls => res.json({

                data: favouritesVinyls
            }))
            
    }, res)
})


//////////CHAT//////////////////////

router.get('/users/:id/friendsVinyls', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { params: { id }, sub } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.retrieveVinylsFriends(id)
            .then(friendsVinyls => res.json({

                data: friendsVinyls
            }))
            
    }, res)
})

router.get('/users/:id/friends', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { params: { id }, sub } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.retrieveFriends(id)
            .then(friends => res.json({

                data: friends
            }))
            
    }, res)
})

router.patch('/users/:id/connected', [bearerTokenParser, jwtVerifier, jsonBodyParser], (req, res) => {
    routeHandler(() => {
        const { params: { id }, sub, body: { connected } } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.connectedUser(id, connected)
            .then(() =>
                res.json({
                    message: 'user online'
                })
            )
    }, res)
})


router.patch('/users/:id/disconnected', [bearerTokenParser, jwtVerifier, jsonBodyParser], (req, res) => {
    routeHandler(() => {
        const { params: { id }, sub, body: { connected } } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.disconnectedUser(id, connected)
            .then(() =>
                res.json({
                    message: 'user offline'
                })
            )
    }, res)
})

router.patch('/users/:id/disconnected/close', [bearerTokenParser, jwtVerifier, jsonBodyParser], (req, res) => {
    routeHandler(() => {
        const { params: { id }, sub, body: { connected } } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.disconnectedUser(id, connected)
            .then(() =>
                res.json({
                    message: 'user offline'
                })
            )
    }, res)
})



module.exports = router