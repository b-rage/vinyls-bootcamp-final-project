'use strict'

const { mongoose, models: { User, Vinyl} } = require('vinyls-data')
const logic = require('./index')
const { AlreadyExistsError, AuthError, NotFoundError, ValueError, NotAllowedError } = require('../errors')
const { expect } = require('chai')
const fs = require('fs')


const MONGO_URL = 'mongodb://localhost:27017/vinyls-test'

// running test from CLI
// normal -> $ mocha ./logic/index.spec.js --timeout 10000
// mocha ./logic/index.spec.js debug
// debug -> $ mocha debug ./index.spec.js --timeout 10000

describe('logic', () => {
    before(() => mongoose.connect(MONGO_URL, { useNewUrlParser: true, useCreateIndex: true }))

    beforeEach(() => Promise.all([User.deleteMany(), Vinyl.deleteMany()]))

    describe('user', () => {
        describe('register', () => {
            let email, username, password

            beforeEach( () => {

                email = `email1-${Math.random()}@tio.com`
                username = `username-${Math.random()}`
                password = `password1-${Math.random()}`

                
            })

            it('should succeed on correct data', async () => {

            
                await logic.registerUser(email, username, password)

                const _user = await User.findOne({username})

                expect(_user.id).to.be.a('string')
                expect(_user.email).to.equal(email)
                expect(_user.username).to.equal(username)
                expect(_user.password).to.equal(password)
            })

            it('should fail on undefined email', () => {
                expect(() => logic.registerUser(undefined, username, password)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on undefined username', () => {
                expect(() => logic.registerUser(email, undefined, password)).to.throw(TypeError, 'undefined is not a string')
            })

            

            it('should fail on repeted username', async () => {

                const email1 = `email-${Math.random()}@tio.com`
                const username1 = 'username'
                const password1 = `password-${Math.random()}`

                const user1 = await new User({ email: email1, username: username1, password: password1 }).save()

                try {
                    await logic.registerUser(email1, username1, password1)
                    expect(true).to.be.false
                } catch (err) {
                    expect(err).to.be.instanceof(AlreadyExistsError)
                    expect(err.message).to.equal(`username ${username1} already registered`)
                }
            })

            it('should fail on undefined password', () => {
                expect(() => logic.registerUser(email, username, undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty email', () => {
                expect(() => logic.registerUser('', username, password)).to.throw(ValueError, 'email is empty or blank')
            })

            it('should fail on empty username', () => {
                expect(() => logic.registerUser(email, '', password)).to.throw(ValueError, 'username is empty or blank')
            })

            it('should fail on empty password', () => {
                expect(() => logic.registerUser(email, username, '')).to.throw(ValueError, 'password is empty or blank')
            })

            it('should fail on blank email', () => {
                expect(() => logic.registerUser('   \t\n', username, password)).to.throw(ValueError, 'email is empty or blank')
            })

            it('should fail on blank username', () => {
                expect(() => logic.registerUser( email, '  \t\n', password)).to.throw(ValueError, 'username is empty or blank')
            })

            it('should fail on blank password', () => {
                expect(() => logic.registerUser(email, username, '   \t\n')).to.throw(ValueError, 'password is empty or blank')
            })

        })

        describe('authenticate', () => {
            let user, email, username, password

            beforeEach(async () => {
                email = `email-${Math.random()}@tio.com`
                username = `username-${Math.random()}`
                password = `password-${Math.random()}`

                user = await new User({ email, username, password }).save()
            })

            it('should succeed on correct data', async () => {
                const id = await logic.authenticateUser(username, password)

                const _user = await User.findOne({ username })

                expect(id).to.be.a('string')
                expect(id).to.equal(_user.id)
            })

            it('should fail on incorrect password', async () => {
                try {
                    await logic.authenticateUser(username, 'password')
                    expect(true).to.be.false
                } catch (err) {
                    expect(err).to.be.instanceof(AuthError)
                    expect(err.message).to.equal(`invalid username or password`)
                }
            })


            it('should fail on undefined username', () => {
                expect(() => logic.authenticateUser(undefined, user.password)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on undefined password', () => {
                expect(() => logic.authenticateUser(user.username, undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty username', () => {
                expect(() => logic.authenticateUser('', password)).to.throw(ValueError, 'username is empty or blank')
            })

            it('should fail on empty password', () => {
                expect(() => logic.authenticateUser(username, '')).to.throw(ValueError, 'password is empty or blank')
            })

            it('should fail on blank username', () => {
                expect(() => logic.authenticateUser('   \t\n', password)).to.throw(ValueError, 'username is empty or blank')
            })

            it('should fail on blank password', () => {
                expect(() => logic.authenticateUser(email, '   \t\n')).to.throw(ValueError, 'password is empty or blank')
            })


        })

        describe('retrieve user by id', () => {
            let user, email, username, password
            
            beforeEach(async () => {
                user = await new User({ email: 'John@jon.com', username: 'jd', password: '123' })

                await user.save()
            })
            

            it('should succeed on correct data', async () => {
                
                const _user = await logic.retrieveUser(user.id)

                const { email, username, idUser } = _user

                expect(_user).not.to.be.instanceof(User)

                expect(idUser).to.exist
               
                expect(idUser).to.be.a('string')
                expect(idUser).to.equal(user.id)
                expect(_user.email).to.equal(email)
                expect(_user.username).to.equal(username)
            })

            it('should fail on undefined id', () => {
                expect(() => logic.retrieveUser(undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                expect(() => logic.retrieveUser('')).to.throw(ValueError, 'id is empty or blank')
            })

            it('should fail on blank id', () => {
                expect(() => logic.retrieveUser('   \t\n')).to.throw(ValueError, 'id is empty or blank')
            })

            describe('without existing user', () => {
                beforeEach(async () => await User.deleteMany())

                it('should fail on not found user', async () => {
                    try {
                        await logic.retrieveUser(user.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`user with id ${user.id} not found`)
                    }
                })
            })

        })


        describe('retrieve gallery Users', () => {
            let user, user2
            
            beforeEach(async () => {
                user = new User({ email: 'John@jon.com', username: 'jd', password: '123' })
                user2 = new User({ email: 'Joh2n@jon.com', username: 'jd2', password: '1232' })

                await user.save()
                await user2.save()
            })
            

            it('should succeed on valid id', async () => {
                const _users = await logic.retrieveGalleryUsers(user.id)

                expect(_users.length).to.equal(1)

            })

            it('should fail on undefined id', () => {
                expect(() => logic.retrieveGalleryUsers(undefined)).to.throw(TypeError, 'undefined is not a string')
                
            })

            it('should fail on empty id', () => {
                expect(() => logic.retrieveGalleryUsers('')).to.throw(ValueError, 'id is empty or blank')
            })

            it('should fail on blank id', () => {
                expect(() => logic.retrieveGalleryUsers('   \t\n')).to.throw(ValueError, 'id is empty or blank')
            })

        })

        describe('retrieve all users', () => {
            let user, user2
            
            beforeEach(async () => {
                user = new User({ email: 'John@jon.com', username: 'jd', password: '123' })
                user2 = new User({ email: 'Joh2n@jon.com', username: 'jd2', password: '1232' })


                await user.save()
                await user2.save()
            })
            

            it('should succeed on correct data', async () => {
                const _users = await logic.retrieveUsers()

                expect(_users.length).to.equal(2)

            })

            false && describe('without existing user', () => {
                beforeEach(async () => await User.deleteMany())

                it('should fail on not found user', async () => {
                    try {
                        await logic.retrieveUsers()
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`users not found`)
                    }
                })
            })


        })


        describe('update user', () => {
            let user

            beforeEach(() => (user = new User({ email:'joe@joe.com', username: 'jd', password: '123', imgProfileUrl: null, bio: null, follows: [], followers: [] })).save())

            it('should update on correct data and password', async () => {
                const {id, username, password, newPassword, imgProfileUrl, bio} = user

                const newUsername = `${username}-${Math.random()}`
                const newImgProfileUrl = `${imgProfileUrl}-${Math.random()}`
                const newBio = `${bio}-${Math.random()}`
     
                const res = await logic.updateUser(id, newUsername, password, null, newImgProfileUrl, newBio)

                expect(res).to.be.undefined

                const _users = await User.find().lean()

                const [_user] = _users

                expect(_user.imgProfileUrl).to.equal(newImgProfileUrl)
                expect(_user.bio).to.equal(newBio)
                expect(_user.username).to.equal(newUsername)

            })

            it('should fail on incorrect password', async () => {

                const { id, username, password } = user

                const newUsername = `${username}-${Math.random()}`
                try {
                    await logic.updateUser(id, newUsername, 'password', null, null, null)
                    expect(true).to.be.false
                } catch (err) {
                    expect(err).to.be.instanceof(AuthError)
                    expect(err.message).to.equal(`invalid password`)
                }
            })

            it('should update on correct id and password, change username (other fields null)', async () => {
                const { id, username, password, imgProfileUrl, bio } = user

                const newUsername = `${username}-${Math.random()}`

                const res = await logic.updateUser(id, newUsername, password, null, null, null)

                expect(res).to.be.undefined

                const _users = await User.find()

                const [_user] = _users

                expect(_user.id).to.equal(id)

                expect(_user.username).to.equal(newUsername)
                expect(_user.password).to.equal(password)
            })

            it('should update on correct id and username, change password (other fields null)', async () => {
                const { id, username, password, imgProfileUrl, bio } = user

                const newPassword = `${password}-${Math.random()}`

                const res = await logic.updateUser(id, username, password, newPassword, null, null)

                expect(res).to.be.undefined

                const _users = await User.find()

                const [_user] = _users

                expect(_user.id).to.equal(id)

                expect(newPassword).to.be.a('string')
                expect(_user.username).to.equal(username)
                expect(_user.password).to.equal(newPassword)
            })

            it('should update on correct id, username and password, adding profile photo (other fields null)', async () => {
                const { id, username, password, imgProfileUrl, bio  } = user

                const newImgProfileUrl = `${imgProfileUrl}-${Math.random()}`

                const res = await logic.updateUser(id, username, password, null, newImgProfileUrl, null)

                expect(res).to.be.undefined

                const _users = await User.find()

                const [_user] = _users

                expect(_user.id).to.equal(id)

                expect(newImgProfileUrl).to.be.a('string')
                expect(_user.username).to.equal(username)
                expect(_user.password).to.equal(password)
                expect(_user.imgProfileUrl).to.equal(newImgProfileUrl)
            })

            it('should update on correct id, username and password, adding bio (other fields null)', async () => {
                const { id, username, password, imgProfileUrl, bio  } = user

                const newBio = `${bio}-${Math.random()}`

                const res = await logic.updateUser(id, username, password, null, null, newBio)

                expect(res).to.be.undefined

                const _users = await User.find()

                const [_user] = _users

                expect(_user.id).to.equal(id)

                expect(newBio).to.be.a('string')
                expect(_user.username).to.equal(username)
                expect(_user.password).to.equal(password)
                expect(_user.imgProfileUrl).to.equal(imgProfileUrl)
                expect(_user.bio).to.equal(newBio)
            })


            it('should update on correct id, username and password, adding bio and photo profile', async () => {
                const { id, username, password, imgProfileUrl, bio  } = user

                const newBio = `${bio}-${Math.random()}`
                const newImgProfileUrl = `${imgProfileUrl}-${Math.random()}`

                const res = await logic.updateUser(id, username, password, null, newImgProfileUrl, newBio)

                expect(res).to.be.undefined

                const _users = await User.find()

                const [_user] = _users

                expect(_user.id).to.equal(id)

                expect(newBio).to.be.a('string')
                expect(newImgProfileUrl).to.be.a('string')
                expect(_user.username).to.equal(username)
                expect(_user.password).to.equal(password)
                expect(_user.imgProfileUrl).to.equal(newImgProfileUrl)
                expect(_user.bio).to.equal(newBio)
            })

            it('should update on correct id, username and password, adding new password, bio and photo profile', async () => {
                const { id, username, password, imgProfileUrl, bio  } = user

                const newBio = `${bio}-${Math.random()}`
                const newImgProfileUrl = `${imgProfileUrl}-${Math.random()}`
                const newPassword = `${password}-${Math.random()}`

                const res = await logic.updateUser(id, username, password, newPassword, newImgProfileUrl, newBio)

                expect(res).to.be.undefined

                const _users = await User.find()

                const [_user] = _users

                expect(_user.id).to.equal(id)

                expect(newBio).to.be.a('string')
                expect(newImgProfileUrl).to.be.a('string')
                expect(newPassword).to.be.a('string')
                expect(_user.username).to.equal(username)
                expect(_user.password).to.equal(newPassword)
                expect(_user.imgProfileUrl).to.equal(newImgProfileUrl)
                expect(_user.bio).to.equal(newBio)
            })


            it('should fail on undefined id', () => {
                const {username, password, imgProfileUrl, bio } = user

                expect(() => logic.updateUser(undefined, username, password, imgProfileUrl, bio)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                const { username, password, imgProfileUrl, bio } = user

                expect(() => logic.updateUser('',  username, password, imgProfileUrl, bio)).to.throw( ValueError, 'id is empty or blank')
            })

            it('should fail on blank id', () => {
                const { username, password, imgProfileUrl, bio } = user

                expect(() => logic.updateUser('  ',  username, password, imgProfileUrl, bio)).to.throw( ValueError, 'id is empty or blank')
            })

            it('should fail on no string id (boolean)', () => {
                const { username, password, imgProfileUrl, bio } = user

                expect(() => logic.updateUser(false,  username, password, imgProfileUrl, bio)).to.throw( TypeError, 'false is not a string')
            })
        
            describe('without existing user', () => {
                beforeEach(async () => await User.deleteMany())

                it('should fail on not found user', async () => {
                    const { id, username, password } = user

                    const newUsername = `${username}-${Math.random()}`

                try {
                    await logic.updateUser(id, newUsername, password, null, null, null)
                    expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`user with id ${user.id} not found`)
                    }
                })
            })


            describe('with existing user', () => {
                let user2

   

            beforeEach(() => (user2 = new User({ email:'joe@hhhhjoe.com', username: 'jdyyy', password: '123', imgProfileUrl: null, bio: null, follows: [], followers: [], comments: [] })).save())

                it('should fail on existing username', async () => {
                    const {id, password, imgProfileUrl, bio } = user2

                    const newUsername = 'jdyyy'

                    try {
                        const res = await logic.updateUser(id, newUsername, password, imgProfileUrl, bio)

                        expect(false).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(AlreadyExistsError)
                    } finally {
                        const _user = await User.findById(id)

                        expect(_user.id).to.equal(id)

                        expect(_user.username).to.equal(newUsername)
                        expect(_user.password).to.equal(password)
                    }
                })
            })
        })

        describe('search users', () => {
            let user, user2, user3, user4
            
            beforeEach(async () => {
                user = new User({ email: 'John@jon.com', username: 'jda', password: '123' })
                user2 = new User({ email: 'Joh2n@jon.com', username: 'jd2', password: '1232' })
                user3 = new User({ email: 'Joh3n@jon.com', username: 'jd3a', password: '1233' })
                user4 = new User({ email: 'Joh2n4@jon.com', username: 'jd24', password: '12342' })


                await user.save()
                await user2.save()
                await user3.save()
                await user4.save()
            })
            

            it('should succeed on correct data', async () => {
                const query = 'j'
                const _users = await logic.searchUsers(query)

                expect(_users.length).to.equal(4)

            })

            it('should succeed on correct data', async () => {
                const query = 'a'
                const _users = await logic.searchUsers(query)

                expect(_users.length).to.equal(2)

            })

            it('should fail on undefined id', () => {
                const query = undefined

                expect(() => logic.searchUsers(query)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                const query = ''

                expect(() => logic.searchUsers(query)).to.throw( ValueError, `${query} is empty or blank`)
            })

            it('should fail on blank id', () => {
                const query = '  '

                expect(() => logic.searchUsers(query)).to.throw( ValueError, `query is empty or blank`)
            })

            it('should fail on no string id (boolean)', () => {
                const query = false

                expect(() => logic.searchUsers(query)).to.throw( TypeError, 'false is not a string')
            })


        })

        describe('add follow', () => {
            let user, user2
            
            beforeEach(async () => {
                user = new User({ email: 'John@jon.com', username: 'jdakk', password: '123' })
                user2 = new User({ email: 'Joh2n@jon.com', username: 'jd2kk', password: '1232' })

                await user.save()
                await user2.save()
            })
            

            it('should succeed on correct data', async () => {
                const res = await logic.addFollow(user.id, user2.username)

                expect(res).to.be.undefined

                const _user = await User.findById(user.id)

                expect(_user.id).to.equal(user.id)

                expect(_user.follows.length).to.equal(1)

                const [followId] = _user.follows

                expect(followId.toString()).to.equal(user2.id)
            })

            it('should fail on undefined id', () => {
                
                const id = undefined
                const followUsername = 'jd2kk'
                expect(() => logic.addFollow(id, followUsername)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                const id = ''
                const followUsername = 'jd2kkf'
                expect(() => logic.addFollow(id, followUsername)).to.throw( ValueError, `${id} is empty or blank`)
            })

            it('should fail on blank id', () => {
                const id = '  '
                const followUsername = 'jd2kkg'
                expect(() => logic.addFollow(id, followUsername)).to.throw( ValueError, `id is empty or blank`)
            })

            it('should fail on no string id (boolean)', () => {
                const id = false    
                const followUsername = 'jd2kkd'
                expect(() => logic.addFollow(id, followUsername)).to.throw( TypeError, 'false is not a string')
            })

            describe('without existing user', () => {
                beforeEach(async () => await User.deleteMany())

                it('should fail on not found user', async () => {
                    const followUsername = 'jd2kkd'
                    try {
                        await logic.addFollow(user.id, followUsername)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`user with id ${user.id} not found`)
                    }
                })
            })

            false && describe('without existing user', () => {
                let user3, user4
                beforeEach(async () => {
                    user3 = new User({ email: 'Johgn@jon.com', username: 'jdhhakk', password: '123' })
                    user4 = new User({ email: 'Jgoh2n@jon.com', username: 'jhhhd2kk', password: '1232' })
    
                    await user3.save()
                    await user4.save()
                })
                

                it('should fail on not found user', async () => {
                    const followUsername = 'jhhhd2kk'
                    const idUser = user3.id
                    const _idUser = idUser.toString()
                    try {
                        await logic.addFollow(_idUser, followUsername)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(NotAllowedError)
                        expect(err.message).to.equal(`user cannot follow himself'`)
                    }
                })
            })

            false && describe('without existing username', () => {

                
                beforeEach(async () => await User.deleteMany())

                it('should fail on not found username', async () => {
                    try {
                        await logic.addFollow(user2.username)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`user with id ${user2.username} not found`)
                    }
                })
            })

            it('should fail on empty followUsername', () => {
                const followUsername = ''
                const id = user.id
                expect(() => logic.addFollow(id, followUsername)).to.throw( ValueError, `${followUsername} is empty or blank`)
            })

            it('should fail on blank followUsername', () => {
                const followUsername = '  '
                const id = user.id
                expect(() => logic.addFollow(id, followUsername)).to.throw( ValueError, `followUsername is empty or blank`)
            })



        })

        describe('remove follow', () => {
            let user, user2, user3, user4
            
            beforeEach(async () => {
                user = new User({ email: 'Johnm@jon.com', username: 'jdmakk', password: '123' })
                user2 = new User({ email: 'Johm2n@jon.com', username: 'jdm2kk', password: '1232' })

                user.follows.length = 1
                user.follows[0] = user2.id

                await user.save()
                await user2.save()

            })
            

            it('should succeed on correct data', async () => {

                const [followId] = user.follows

                expect(followId.toString()).to.equal(user2.id)

                const res = await logic.removeFollow(user.id, user2.username)

                expect(res).to.be.undefined

                const _user = await User.findById(user.id)

                expect(_user.id).to.equal(user.id)

                expect(_user.follows.length).to.equal(0)

                
            })

            it('should fail on undefined id', () => {
                
                const id = undefined
                const followUsername = 'jd2kk'
                expect(() => logic.removeFollow(id, followUsername)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                const id = ''
                const followUsername = 'jd2kkf'
                expect(() => logic.removeFollow(id, followUsername)).to.throw( ValueError, `${id} is empty or blank`)
            })

            it('should fail on blank id', () => {
                const id = '  '
                const followUsername = 'jd2kkg'
                expect(() => logic.removeFollow(id, followUsername)).to.throw( ValueError, `id is empty or blank`)
            })

            it('should fail on no string id (boolean)', () => {
                const id = false    
                const followUsername = 'jd2kkd'
                expect(() => logic.removeFollow(id, followUsername)).to.throw( TypeError, 'false is not a string')
            })

            it('should fail on empty followUsername', () => {
                const followUsername = ''
                const id = user.id
                expect(() => logic.removeFollow(id, followUsername)).to.throw( ValueError, `${followUsername} is empty or blank`)
            })

            it('should fail on blank followUsername', () => {
                const followUsername = '  '
                const id = user.id
                expect(() => logic.removeFollow(id, followUsername)).to.throw( ValueError, `followUsername is empty or blank`)
            })

            describe('without existing user', () => {
                beforeEach(async () => await User.deleteMany())

                it('should fail on not found user', async () => {
                    const followUsername = 'jd2kkf'
                    try {
                        await logic.removeFollow(user.id, followUsername)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`user with id ${user.id} not found`)
                    }
                })
            })


        })

        describe('is follow?', () => {
            let user, user2
            
            beforeEach(async () => {
                user = new User({ email: 'Johnm@jon.com', username: 'jdmakk', password: '123' })
                user2 = new User({ email: 'Johm2n@jon.com', username: 'jdm2kk', password: '1232' })

                user.follows.length = 1

                await user.save()
                await user2.save()

            })
            

            it('should succeed on correct data', async () => {


                const _user = await User.findById(user.id)

                expect(_user.follows.length).to.equal(1)
  

                
            })

            it('should fail on undefined id', () => {
                
                const id = undefined
                expect(() => logic.isFollows(id)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                const id = ''
                expect(() => logic.isFollows(id)).to.throw( ValueError, `${id} is empty or blank`)
            })

            it('should fail on blank id', () => {
                const id = '  '
                expect(() => logic.isFollows(id)).to.throw( ValueError, `id is empty or blank`)
            })

            it('should fail on no string id (boolean)', () => {
                const id = false    
                expect(() => logic.isFollows(id)).to.throw( TypeError, 'false is not a string')
            })

            describe('without existing user', () => {
                beforeEach(async () => await User.deleteMany())

                it('should fail on not found user', async () => {
                    try {
                        await logic.isFollows(user.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`user with id ${user.id} not found`)
                    }
                })
            })

        })

        describe('retrieve ListFollows', () => {
            let user, user2
            
            beforeEach(async () => {
                user = new User({ email: 'Johnm@jon.com', username: 'jdmakk', password: '123' })
                user2 = new User({ email: 'Johm2n@jon.com', username: 'jdm2kk', password: '1232' })      
                
                user.follows.length = 1

                await user.save()
                await user2.save()

            })
            

            it('should succeed on correct data', async () => {

                const res = await logic.retrieveListFollows(user2.id)

                const _user = await User.findById(user.id)

                expect(_user.follows.length).to.equal(1)
                
            })

            it('should fail on undefined id', () => {
                
                const id = undefined
                expect(() => logic.retrieveListFollows(id)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                const id = ''
                expect(() => logic.retrieveListFollows(id)).to.throw( ValueError, `${id} is empty or blank`)
            })

            it('should fail on blank id', () => {
                const id = '  '
                expect(() => logic.retrieveListFollows(id)).to.throw( ValueError, `id is empty or blank`)
            })

            it('should fail on no string id (boolean)', () => {
                const id = false    
                expect(() => logic.retrieveListFollows(id)).to.throw( TypeError, 'false is not a string')
            })

            describe('without existing user', () => {
                beforeEach(async () => await User.deleteMany())

                it('should fail on not found user', async () => {
                    try {
                        await logic.retrieveListFollows(user.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`user with id ${user.id} not found`)
                    }
                })
            })
            

        })

        describe('retrieve List Vinyls Followees', () => {
            let user
            
            beforeEach(async () => {
                user = new User({ email: 'Johnm@jon.com', username: 'jdmakk', password: '123' })

                user.follows.length = 1
                user.followers.length = 2

  
                await user.save()

            })
            

            it('should succeed on correct data', async () => {

                await logic.retrieveVinylsFollowees(user._id.toString())

                
                const _user = await User.findById(user._id).lean()

                let follows = _user.follows

                expect(follows.length).to.equal(1)

                
            })

            it('should fail on undefined id', () => {
                
                const id = undefined
                expect(() => logic.retrieveVinylsFollowees(id)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                const id = ''
                expect(() => logic.retrieveVinylsFollowees(id)).to.throw( ValueError, `${id} is empty or blank`)
            })

            it('should fail on blank id', () => {
                const id = '  '
                expect(() => logic.retrieveVinylsFollowees(id)).to.throw( ValueError, `id is empty or blank`)
            })

            it('should fail on no string id (boolean)', () => {
                const id = false    
                expect(() => logic.retrieveVinylsFollowees(id)).to.throw( TypeError, 'false is not a string')
            })

            describe('without existing user', () => {
                beforeEach(async () => await User.deleteMany())

                it('should fail on not found user', async () => {
                    try {
                        await logic.retrieveVinylsFollowees(user.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`user with id ${user.id} not found`)
                    }
                })
            })

        })

        describe('retrieve ListFollowers', () => {
            let user, user2
            
            beforeEach(async () => {
                user = new User({ email: 'Jddohnm@jon.com', username: 'jdmddakk', password: '123' })
                user2 = new User({ email: 'Johddm2n@jon.com', username: 'jddm2kk', password: '1232' })

                user.follows.length = 1
                user2.followers[0] = user.id


                await user.save()
                await user2.save()

            })
            

            it('should succeed on correct data', async () => {

                const res = await logic.retrieveListFollowers(user2.id)

                const foll = user2.followers[0]

                expect(foll).to.equal(user.id)

                
            })

            it('should fail on undefined id', () => {
                
                const id = undefined
                expect(() => logic.retrieveListFollowers(id)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                const id = ''
                expect(() => logic.retrieveListFollowers(id)).to.throw( ValueError, `${id} is empty or blank`)
            })

            it('should fail on blank id', () => {
                const id = '  '
                expect(() => logic.retrieveListFollowers(id)).to.throw( ValueError, `id is empty or blank`)
            })

            it('should fail on no string id (boolean)', () => {
                const id = false    
                expect(() => logic.retrieveListFollowers(id)).to.throw( TypeError, 'false is not a string')
            })

            describe('without existing user', () => {
                beforeEach(async () => await User.deleteMany())

                it('should fail on not found user', async () => {
                    try {
                        await logic.retrieveListFollowers(user.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`user with id ${user.id} not found`)
                    }
                })
            })

            

        })

        describe('add profile pictures ', ()=> {
            let user, username, email, password
            beforeEach(() => {
                username = 'John'

                email = `jd-${Math.random()}@example.com`
                password = `jd-${Math.random()}`

                user = new User({ email, username, password })

                return user.save()

            })
            it('should succed on correct data', async () => {
 
                let image = './data/test-images/icon-profile.png'

                let file = fs.createReadStream(image)

                const res = await logic.addProfilePicture(user._id.toString(), file)

                expect(res).to.be.undefined

                let _users = await User.find().lean()

                expect(_users.length).to.equal(1)

                let [_user] = _users

                expect(_user._id.toString()).to.be.a('string')
                expect(_user.email).to.equal(email)
                expect(_user.password).to.equal(password)
                expect(_user.imgProfileUrl).to.be.a('string')
                
            })

            it('should fail on undefined id', () => {
                
                let image = './data/test-images/icon-profile.png'

                let file = fs.createReadStream(image)
                const id = undefined
                expect(() => logic.addProfilePicture(id, file)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                let image = './data/test-images/icon-profile.png'

                let file = fs.createReadStream(image)
                const id = ''
                expect(() => logic.addProfilePicture(id, file)).to.throw( ValueError, `${id} is empty or blank`)
            })

            it('should fail on blank id', () => {
                let image = './data/test-images/icon-profile.png'

                let file = fs.createReadStream(image)
                const id = '  '
                expect(() => logic.addProfilePicture(id, file)).to.throw( ValueError, `userId is empty or blank`)
            })

            it('should fail on no string id (boolean)', () => {
                let image = './data/test-images/icon-profile.png'

                let file = fs.createReadStream(image)
                const id = false    
                expect(() => logic.addProfilePicture(id, file)).to.throw( TypeError, 'false is not a string')
            })

            describe('without existing user', () => {
                beforeEach(async () => await User.deleteMany())

                it('should fail on not found user', async () => {
                    let image = './data/test-images/icon-profile.png'

                    let file = fs.createReadStream(image)

                    try {
                        await logic.addProfilePicture(user.id, file)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`user does not exist`)
                    }
                })
            })
        }) 

        describe('connected user', () => {
            let user, connected
            
            beforeEach(async () => {
                user = new User({ email: 'John@jon.com', username: 'jdakk', password: '123' })
            
                await user.save()
     
            })

            
            it('should succeed on correct data', async () => {

                connected = 'online'

                const res = await logic.connectedUser(user.id, connected)

                const _user = await User.findById(user.id)

                expect(_user.id).to.equal(user.id)

                expect(_user.connection).to.equal('online')

       
            })

            false && it('should fail on not found id', async () => {

                connected = 'online'
                let id = '1234'
               
                try {

                    await logic.connectedUser(id, connected)
                    expect(true).to.be.false
                } catch (err) {
                    expect(err).to.be.instanceof(NotFoundError)
                    expect(err.message).to.equal(`user does not exist`)
                }
            })

            it('should fail on undefined id', () => {
                
                const id = undefined
                const connected = 'online'
                expect(() => logic.connectedUser(id, connected)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                const id = ''
                const connected = 'online'
                expect(() => logic.connectedUser(id, connected)).to.throw( ValueError, `${id} is empty or blank`)
            })

            it('should fail on blank id', () => {
                const id = '  '
                const connected = 'online'
                expect(() => logic.connectedUser(id, connected)).to.throw( ValueError, `id is empty or blank`)
            })

            it('should fail on no string id (boolean)', () => {
                const id = false    
                const connected = 'online'
                expect(() => logic.connectedUser(id, connected)).to.throw( TypeError, 'false is not a string')
            })

            it('should fail on empty connected', () => {
                const connected = ''
                const id = user.id
                expect(() => logic.connectedUser(id, connected)).to.throw( ValueError, `${connected} is empty or blank`)
            })

            it('should fail on blank connected', () => {
                const connected = '  '
                const id = user.id
                expect(() => logic.connectedUser(id, connected)).to.throw( ValueError, `connected is empty or blank`)
            })

            it('should fail on undefined connected', () => {
                const connected = undefined
                const id = user.id
                expect(() => logic.connectedUser(id, connected)).to.throw( TypeError, 'undefined is not a string')
            })

            it('should fail on no string connected (boolean)', () => {
                const id = user.id  
                const connected = false
                expect(() => logic.connectedUser(id, connected)).to.throw( TypeError, 'false is not a string')
            })

            describe('without existing user', () => {
                beforeEach(async () => await User.deleteMany())

                it('should fail on not found user', async () => {
                    connected = 'online'
                    try {
                        await logic.connectedUser(user.id, connected)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`user does not exist`)
                    }
                })
            })

            

        })

        describe('disconnected user', () => {
            let user, connected
            
            beforeEach(async () => {
                user = new User({ email: 'John@jon.com', username: 'jdakk', password: '123' })
            
                await user.save()
     
            })
            

            it('should succeed on correct data', async () => {

                connected = 'offline'

                const res = await logic.connectedUser(user.id, connected)

                const _user = await User.findById(user.id)

                expect(_user.id).to.equal(user.id)

                expect(_user.connection).to.equal('offline')

       
            })

            false && it('should fail on not found id', async () => {

                connected = 'offline'
                let id = '1234'

                try {

                    await logic.connectedUser(id, connected)
                    expect(true).to.be.false
                } catch (err) {
                    expect(err).to.be.instanceof(NotFoundError)
                    expect(err.message).to.equal(`user does not exist`)
                }
            })

            it('should fail on undefined id', () => {
                
                const id = undefined
                connected = 'offline'
                expect(() => logic.disconnectedUser(id, connected)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                const id = ''
                connected = 'offline'
                expect(() => logic.disconnectedUser(id, connected)).to.throw( ValueError, `${id} is empty or blank`)
            })

            it('should fail on blank id', () => {
                const id = '  '
                connected = 'offline'
                expect(() => logic.disconnectedUser(id, connected)).to.throw( ValueError, `id is empty or blank`)
            })

            it('should fail on no string id (boolean)', () => {
                const id = false    
                connected = 'offline'
                expect(() => logic.disconnectedUser(id, connected)).to.throw( TypeError, 'false is not a string')
            })

            it('should fail on empty connected', () => {
                connected = ''
                const id = user.id
                expect(() => logic.disconnectedUser(id, connected)).to.throw( ValueError, `${connected} is empty or blank`)
            })

            it('should fail on blank connected', () => {
                connected = '  '
                const id = user.id
                expect(() => logic.disconnectedUser(id, connected)).to.throw( ValueError, `connected is empty or blank`)
            })

            it('should fail on undefined connected', () => {
                connected = undefined
                const id = user.id
                expect(() => logic.disconnectedUser(id, connected)).to.throw( TypeError, 'undefined is not a string')
            })

            it('should fail on no string connected (boolean)', () => {
                const id = user.id  
                connected = false
                expect(() => logic.disconnectedUser(id, connected)).to.throw( TypeError, 'false is not a string')
            })

            describe('without existing user', () => {
                beforeEach(async () => await User.deleteMany())

                it('should fail on not found user', async () => {
                    connected = 'offline'
                    try {
                        await logic.disconnectedUser(user.id, connected)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`user does not exist`)
                    }
                })
            })

            

        })



    })

    describe('vinyls', () => {
        describe('add Vinyl', () => {
            let user
            beforeEach(async () => {

                user = new User({ email: 'John@ff.com', username: 'jvvvvd', password: '123' })

                await user.save()

            })

            it('should succeed on correct data', async () => {

                const id = user.id
                const title = 'neverm'
                const artist = 'nirvana'
                const year = '1992'
                const imgVinylUrl = null
                const info = null


                const res = await logic.addVinyl(id, title, artist, year, imgVinylUrl, info )

                expect(res).not.to.be.undefined

                const vinyls = await Vinyl.find().lean()

                const [vinyl] = vinyls


                expect(vinyl.title).to.equal(title)
                expect(vinyl.artist).to.equal(artist)
                expect(vinyl.year).to.equal(year)

                expect(vinyl.id.toString()).to.equal(user._id.toString())
            })

            it('should fail on undefined id', () => {
                
                const id = undefined
                const title = 'neverm'
                const artist = 'nirvana'
                const year = 1992
                const imgVinylUrl = null
                const info = null
                expect(() => logic.addVinyl(id, title, artist, year, imgVinylUrl, info )).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                const id = ''
                const title = 'neverm3'
                const artist = 'nirvan3a'
                const year = 1992
                const imgVinylUrl = null
                const info = null
                expect(() => logic.addVinyl(id, title, artist, year, imgVinylUrl, info )).to.throw( ValueError, `${id} is empty or blank`)
            })

            it('should fail on blank id', () => {
                const id = '  '
                const title = 'nerverm'
                const artist = 'nirrvana'
                const year = 1992
                const imgVinylUrl = null
                const info = null
                expect(() => logic.addVinyl(id, title, artist, year, imgVinylUrl, info )).to.throw( ValueError, `id is empty or blank`)
            })

            it('should fail on no string id (boolean)', () => {
                const id = false 
                const title = 'nreverm'
                const artist = 'nrirvana'
                const year = 1992
                const imgVinylUrl = null
                const info = null   
                expect(() => logic.addVinyl(id, title, artist, year, imgVinylUrl, info )).to.throw( TypeError, 'false is not a string')
            })

            it('should fail on undefined title', () => {
                
                const id = user.id
                const title = undefined
                const artist = 'nirvana'
                const year = 1992
                const imgVinylUrl = null
                const info = null
                expect(() => logic.addVinyl(id, title, artist, year, imgVinylUrl, info )).to.throw(TypeError, 'undefined is not a string')
            })


            it('should fail on empty title', () => {
                const id = user.id
                const title = ''
                const artist = 'nirvan3a'
                const year = 1992
                const imgVinylUrl = null
                const info = null
                expect(() => logic.addVinyl(id, title, artist, year, imgVinylUrl, info )).to.throw( ValueError, `title is empty or blank`)
            })

            it('should fail on blank title', () => {
                const id = user.id
                const title = '  '
                const artist = 'nirrvana'
                const year = 1992
                const imgVinylUrl = null
                const info = null
                expect(() => logic.addVinyl(id, title, artist, year, imgVinylUrl, info )).to.throw( ValueError, `title is empty or blank`)
            })

            it('should fail on no string title (boolean)', () => {
                const id = user.id
                const title = false
                const artist = 'nrirvana'
                const year = 1992
                const imgVinylUrl = null
                const info = null   
                expect(() => logic.addVinyl(id, title, artist, year, imgVinylUrl, info )).to.throw( TypeError, 'false is not a string')
            })

            it('should fail on undefined artist', () => {
                
                const id = user.id
                const title = 'nevs'
                const artist = undefined
                const year = 1992
                const imgVinylUrl = null
                const info = null
                expect(() => logic.addVinyl(id, title, artist, year, imgVinylUrl, info )).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty artist', () => {
                const id = user.id
                const artist = ''
                const title = 'nirvaxn3a'
                const year = 1992
                const imgVinylUrl = null
                const info = null
                expect(() => logic.addVinyl(id, title, artist, year, imgVinylUrl, info )).to.throw( ValueError, `artist is empty or blank`)
            })

            it('should fail on blank artist', () => {
                const id = user.id
                const artist = '  '
                const title = 'nirrvxana'
                const year = 1992
                const imgVinylUrl = null
                const info = null
                expect(() => logic.addVinyl(id, title, artist, year, imgVinylUrl, info )).to.throw( ValueError, `artist is empty or blank`)
            })

            it('should fail on no string artist (boolean)', () => {
                const id = user.id
                const artist = false
                const title = 'nrirxvana'
                const year = 1992
                const imgVinylUrl = null
                const info = null   
                expect(() => logic.addVinyl(id, title, artist, year, imgVinylUrl, info )).to.throw( TypeError, 'false is not a string')
            })

            it('should fail on undefined year', () => {
                const id = user.id
                const artist = 'nirv'
                const title = 'nirvaxn3a'
                const year = undefined
                const imgVinylUrl = null
                const info = null
                expect(() => logic.addVinyl(id, title, artist, year, imgVinylUrl, info )).to.throw( TypeError, `undefined is not a string`)
            })

            it('should fail on no string year (boolean)', () => {
                const id = user.id
                const artist = 'nirv'
                const title = 'nrirxvana'
                const year = false
                const imgVinylUrl = null
                const info = null   
                expect(() => logic.addVinyl(id, title, artist, year, imgVinylUrl, info )).to.throw( TypeError, 'false is not a string')
            })


            describe('without existing user', () => {
                beforeEach(async () => await User.deleteMany())

                it('should fail on not found user', async () => {

                    const title = 'neverm'
                    const artist = 'nirvana'
                    const year = '1992'
                    const imgVinylUrl = null
                    const info = null

                    try {
                        await logic.addVinyl(user.id, title, artist, year, imgVinylUrl, info)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`user with id ${user.id} not found`)
                    }
                })
            })
        })

        describe('add vinyl picture ',  ()=> {
            let user, vinyl
            beforeEach( async () => {
                const username = 'John'

                const email = `jd-${Math.random()}@example.com`
                const password = `jd-${Math.random()}`

                user = new User({ email, username, password })

                await user.save()

                const id = user.id
                const title = 'neverm'
                const artist = 'nirvana'
                const year = 1992
                const imgVinylUrl = null
                const info = null

                vinyl = new Vinyl({ id, title, artist, year, imgVinylUrl, info })

                await vinyl.save()

            })
            it('should succed on correct data', async () => {
 
                let image = './data/test-images/icon-profile.png'

                var file = fs.createReadStream(image)

                const res = await logic.addVinylPicture(file, vinyl._id.toString())

                expect(res).to.be.undefined

                let _vinyls = await Vinyl.find().lean()

                expect(_vinyls.length).to.equal(1)

                let [_vinyl] = _vinyls

                expect(_vinyl._id.toString()).to.be.a('string')
                expect(_vinyl.title).to.equal(vinyl.title)
                expect(_vinyl.artist).to.equal(vinyl.artist)
                expect(_vinyl.info).to.equal(vinyl.info)
                expect(_vinyl.imgVinylUrl).to.be.a('string')
                
            })

        

            false && describe('without existing vinyl', () => {
                beforeEach(async () => await Vinyl.deleteMany())

                it('should fail on not found vinyl', async () => {

                    let image = './data/test-images/icon-profile.png'

                    var file = fs.createReadStream(image)
                    
                    try {
                        await logic.addVinylPicture(file, vinyl._id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`vinyl does not exist`)
                    }
                })
            })
        }) 

        describe('retrieve all vinyls', () => {
            let vinyl, user
            
            beforeEach(async () => {
                
                user = new User({ email: 'John@ff.com', username: 'jvvvvd', password: '123' })

                await user.save()
                const id = user.id
                const title = 'neverm'
                const artist = 'nirvana'
                const year = 1992
                const imgVinylUrl = null
                const info = null

                vinyl = new Vinyl({ id, title, artist, year, imgVinylUrl, info  })


                await vinyl.save()

            })
            

            it('should succeed on correct data', async () => {
                const _vinyls = await logic.retrieveVinyls()

                expect(_vinyls.length).to.equal(1)

            })


        })

        describe('retrieve vinyl by id', () => {
            let vinyl, user
            
            beforeEach(async () => {
                
                user = new User({ email: 'Jozzhn@ff.com', username: 'jvzzvvvd', password: '123' })

                await user.save()

                const title = 'neverm'
                const artist = 'nirvana'
                const year = 1992
                const imgVinylUrl = null
                const info = null

                vinyl = new Vinyl({ id:user._id, title, artist, year, imgVinylUrl, info  })


                await vinyl.save()

            })
            

            it('should succeed on correct data', async () => {
                const idVinyl = vinyl._id.toString()
               

                const _vinyl = await logic.retrieveVinylById(idVinyl)


                const { id, title, artist, year } = _vinyl

                expect(_vinyl).not.to.be.instanceof(Vinyl)

                expect(id.toString()).to.exist

   
                expect(vinyl.title).to.equal(title)
                expect(vinyl.artist).to.equal(artist)
                expect(vinyl.year).to.equal(year)

            })

            it('should fail on undefined id', () => {
                expect(() => logic.retrieveVinylById(undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                expect(() => logic.retrieveVinylById('')).to.throw(ValueError, 'id is empty or blank')
            })

            it('should fail on blank id', () => {
                expect(() => logic.retrieveVinylById('   \t\n')).to.throw(ValueError, 'id is empty or blank')
            })

            it('should fail on boolean id', () => {
                expect(() => logic.retrieveVinylById(false)).to.throw(TypeError, 'false is not a string')
            })

            describe('without existing vinyl', () => {
                beforeEach(async () => await Vinyl.deleteMany())

                it('should fail on not found vinyl', async () => {
                    
                    try {
                        await logic.retrieveVinylById(vinyl._id.toString())
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`vinyl with id ${vinyl._id} not found`)
                    }
                })
            })


        })

        describe('retrieve vinyl by user id', () => {
            let vinyl, user, id
            
            beforeEach(async () => {
                
                user = new User({ email: 'Jozzhn@ff.com', username: 'jvzzvvvd', password: '123' })

                await user.save()

                id = user._id
                const title = 'neverm'
                const artist = 'nirvana'
                const year = 1992
                const imgVinylUrl = null
                const info = null

                vinyl = new Vinyl({ id, title, artist, year, imgVinylUrl, info  })


                await vinyl.save()

            })
            

            it('should succeed on correct data', async () => {

                let id = vinyl.id.toString()

                expect(id.toString()).to.exist

                                
                const _vinyls = await logic.retrieveVinylsByUserId(id)

                _vinyls.forEach(_vinyl => {
                    
                    expect(_vinyl.id.toString()).to.equal(id)

                })   

            })

            it('should fail on undefined id', () => {
                expect(() => logic.retrieveVinylsByUserId(undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                expect(() => logic.retrieveVinylsByUserId('')).to.throw(ValueError, 'id is empty or blank')
            })

            it('should fail on blank id', () => {
                expect(() => logic.retrieveVinylsByUserId('   \t\n')).to.throw(ValueError, 'id is empty or blank')
            })

            it('should fail on boolean id', () => {
                expect(() => logic.retrieveVinylsByUserId(false)).to.throw(TypeError, 'false is not a string')
            })

            false && describe('without existing user', () => {
                beforeEach(async () => await User.deleteMany())

                it('should fail on not found user', async () => {
                    try {
                        await logic.retrieveVinylsByUserId(id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`vinyls with user id ${id} not found`)
                    }
                })
            })


        })

        describe('search vinyls', () => {
            let  user
            
            beforeEach(async () => {

                user = new User({ email: 'Jozzhn@ff.com', username: 'jvzzvvvd', password: '123' })

                await user.save()
                const id = user._id

                const artist = 'nirvana'
                const year = 1992
                const imgVinylUrl = null
                const info = null

                const vinyl = new Vinyl({ id, title: 'ngitvana', artist, year, imgVinylUrl, info  })
                const vinyl2 = new Vinyl({ id, title: 'gggg', artist, year, imgVinylUrl, info  })
                const vinyl3 = new Vinyl({ id, title: 'gggggh', artist, year, imgVinylUrl, info  })
                const vinyl4 = new Vinyl({ id, title: 'gggggh', artist, year, imgVinylUrl, info  })


                await vinyl.save()
                await vinyl2.save()
                await vinyl3.save()
                await vinyl4.save()
            })
            

            it('should succeed on correct data', async () => {
                const query = 'g'
                const _vinyls = await logic.searchVinyls(query)

                expect(_vinyls.length).to.equal(4)

            })

            it('should succeed on correct data', async () => {
                const query = 'h'
                const _vinyls = await logic.searchVinyls(query)

                expect(_vinyls.length).to.equal(2)

            })

            it('should fail on undefined query', () => {
                const query = undefined

                expect(() => logic.searchVinyls(query)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty query', () => {
                const query = ''

                expect(() => logic.searchVinyls(query)).to.throw( ValueError, `${query} is empty or blank`)
            })

            it('should fail on blank query', () => {
                const query = '  '

                expect(() => logic.searchVinyls(query)).to.throw( ValueError, `query is empty or blank`)
            })

            it('should fail on no string query (boolean)', () => {
                const query = false

                expect(() => logic.searchVinyls(query)).to.throw( TypeError, 'false is not a string')
            })


        })

        describe('remove vinyl', () => {
            let vinyl, user
            
            beforeEach(async () => {

                user = new User({ email: 'Jozzhn@ff.com', username: 'jvzzvvvd', password: '123' })

                await user.save()
                const id = user._id
                const title = 'nevermindhh'
                const artist = 'nirvanahh'
                const year = 1992
                const imgVinylUrl = null
                const info = null

                vinyl = new Vinyl({ id, title, artist, year, imgVinylUrl, info  })

                await vinyl.save()

            })
            

            it('should succeed on correct data', async () => {

                const vinylId= vinyl._id.toString()

                const res = await logic.removeVinyl(vinylId)

                expect(res).to.be.undefined

                const _vinyls = await Vinyl.find()

                expect(_vinyls.length).to.equal(0)

            })


            it('should fail on undefined id', () => {
                const vinylId = undefined

                expect(() => logic.removeVinyl(vinylId)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                const vinylId = ''

                expect(() => logic.removeVinyl(vinylId)).to.throw( ValueError, `${vinylId} is empty or blank`)
            })

            it('should fail on blank id', () => {
                const vinylId = '  '

                expect(() => logic.removeVinyl(vinylId)).to.throw( ValueError, `id is empty or blank`)
            })

            it('should fail on no string id (boolean)', () => {
                const vinylId = false

                expect(() => logic.removeVinyl(vinylId)).to.throw( TypeError, 'false is not a string')
            })

            describe('without existing vinyl', () => {
                beforeEach(async () => await Vinyl.deleteMany())

                it('should fail on not found vinyl', async () => {
                    
                    try {
                        await logic.retrieveVinylById(vinyl._id.toString())
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`vinyl with id ${vinyl._id} not found`)
                    }
                })
            })


        })

        describe('edit vinyl', () => {
            let vinyl, user
            
            beforeEach(async () => {

                user = new User({ email: 'Jozzhn@ff.com', username: 'jvzzvvvd', password: '123' })

                await user.save()
                const id = user._id.toString()
                const title = 'neveggrmindhh'
                const artist = 'nirvgganahh'
                const year = '1992'
                const imgVinylUrl = null
                const info = null


                vinyl = new Vinyl({ id, title, artist, year, imgVinylUrl, info  })

                await vinyl.save()

            })

            it('should update on correct data', async () => {

                const { id, title, artist, year, imgVinylUrl, info } = vinyl

                const vinylId = vinyl._id.toString()
 
                const newTitle = `${title}-${Math.random()}`
                const newArtist = `${artist}-${Math.random()}`
                const newimgVinylUrl = null
                const newInfo = null
                const newYear = '1993'


                const res = await logic.editVinyl( vinylId, newTitle, newArtist, newYear, newimgVinylUrl, newInfo)

                expect(res).to.be.undefined

                const _vinyls = await Vinyl.find()

                const [ _vinyl ] = _vinyls


                expect(_vinyl.title).to.equal(newTitle)
                expect(_vinyl.artist).to.equal(newArtist)
                expect(_vinyl.year).to.equal(newYear)
            })

            


            it('should fail on undefined id', () => {
                const {newTitle, newArtist, newYear, newimgVinylUrl, newInfo } = vinyl

                expect(() => logic.editVinyl( undefined, newTitle, newArtist, newYear, newimgVinylUrl, newInfo)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                const {newTitle, newArtist, newYear, newimgVinylUrl, newInfo } = vinyl

                expect(() => logic.editVinyl( '', newTitle, newArtist, newYear, newimgVinylUrl, newInfo)).to.throw(ValueError, 'id is empty or blank')
            })

            it('should fail on blank id', () => {
                const {newTitle, newArtist, newYear, newimgVinylUrl, newInfo } = vinyl

                expect(() => logic.editVinyl( '  ', newTitle, newArtist, newYear, newimgVinylUrl, newInfo)).to.throw(ValueError, 'id is empty or blank')
            })

            it('should fail on no string id (boolean)', () => {
                const {newTitle, newArtist, newYear, newimgVinylUrl, newInfo } = vinyl

                expect(() => logic.editVinyl( false, newTitle, newArtist, newYear, newimgVinylUrl, newInfo)).to.throw(TypeError, 'false is not a string')
            })

            false && describe('without existing vinyl', () => {
                beforeEach(async () => await Vinyl.deleteMany())

                it('should fail on not found vinyl', async () => {

                    const {newTitle, newArtist, newYear, newimgVinylUrl, newInfo } = vinyl
                    
                    try {
                        await logic.editVinyl(vinyl._id.toString(), newTitle, newArtist, newYear, newimgVinylUrl, newInfo )
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`vinyl with id ${vinyl._id} not found`)
                    }
                })
            })

        })

        describe('add like to vinyl', () => {
            let user, vinyl
            
            beforeEach(async () => {
                user = new User({ email: 'John@jon.com', username: 'jdakk', password: '123' })

                await user.save()

                const id = user._id.toString()
                const title = 'neveghhgrmindhh'
                const artist = 'nirvgghhanahh'
                const year = 1992
                const imgVinylUrl = null
                const info = null
                const likes = []

                vinyl = new Vinyl({ id, title, artist, year, imgVinylUrl, info , likes })

                await vinyl.save()

            })
            

            it('should succeed on correct data', async () => {

                const idVinyl = vinyl._id.toString()
                const id = user._id.toString()
                const res = await logic.addLikeToVinyl(idVinyl, id)

                expect(res).to.be.undefined

                const _vinyl = await Vinyl.findById(idVinyl)

  

                expect(_vinyl.likes.length).to.equal(1)

                const [likesId] = _vinyl.likes

                expect(likesId.toString()).to.equal(vinyl.id.toString())
            })

            it('should fail on undefined id', () => {
                
                const idVinyl = undefined
                const idUser = 'jd2kk'
                expect(() => logic.addLikeToVinyl(idVinyl, idUser)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                const idVinyl = ''
                const idUser = 'jd2kkf'
                expect(() => logic.addLikeToVinyl(idVinyl, idUser)).to.throw( ValueError, `${idVinyl} is empty or blank`)
            })

            it('should fail on blank id', () => {
                const idVinyl = '  '
                const idUser = 'jd2kkg'
                expect(() => logic.addLikeToVinyl(idVinyl, idUser)).to.throw( ValueError, `id is empty or blank`)
            })

            it('should fail on no string id (boolean)', () => {
                const idVinyl = false    
                const idUser = 'jd2kkd'
                expect(() => logic.addLikeToVinyl(idVinyl, idUser)).to.throw( TypeError, 'false is not a string')
            })

            it('should fail on undefined userId', () => {
                const idVinyl = 'hhh3h43h'
                const idUser = undefined
                expect(() => logic.addLikeToVinyl(idVinyl, idUser)).to.throw( TypeError, `undefined is not a string`)
            })

            it('should fail on empty userId', () => {
                const idVinyl = 'hhh3h43h'
                const idUser = ''
                expect(() => logic.addLikeToVinyl(idVinyl, idUser)).to.throw( ValueError, `${idUser} is empty or blank`)
            })

            it('should fail on blank userId', () => {
                const idVinyl = 'hhh3h43h'
                const idUser = '  '
                expect(() => logic.addLikeToVinyl(idVinyl, idUser)).to.throw( ValueError, `userId is empty or blank`)
            })

            it('should fail on no string userId (boolean)', () => {
                const idVinyl = 'hhh3h43h'
                const idUser = false
                expect(() => logic.addLikeToVinyl(idVinyl, idUser)).to.throw( TypeError, `false is not a string`)
            })


        })

        describe('remove like to vinyl', () => {
            let user, vinyl
            
            beforeEach(async () => {
                user = new User({ email: 'John@jon.com', username: 'jdakk', password: '123' })

                await user.save()

                const id = user._id.toString()
                const title = 'neveghhgrmindhh'
                const artist = 'nirvgghhanahh'
                const year = 1992
                const imgVinylUrl = null
                const info = null
                const likes = [id]

                vinyl = new Vinyl({ id, title, artist, year, imgVinylUrl, info , likes })

                await vinyl.save()

            })
            

            it('should succeed on correct data', async () => {

                const idVinyl = vinyl._id.toString()
                const idUser = vinyl.id.toString()
                const res = await logic.removeLikeToVinyl(idVinyl, idUser)

                expect(res).to.be.undefined

                const _vinyl = await Vinyl.findById(idVinyl)

  

                expect(_vinyl.likes.length).to.equal(0)

  
            })

            it('should fail on undefined id', () => {
                
                const idVinyl = undefined
                const idUser = 'jd2kk'
                expect(() => logic.removeLikeToVinyl(idVinyl, idUser)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                const idVinyl = ''
                const idUser = 'jd2kkf'
                expect(() => logic.removeLikeToVinyl(idVinyl, idUser)).to.throw( ValueError, `${idVinyl} is empty or blank`)
            })

            it('should fail on blank id', () => {
                const idVinyl = '  '
                const idUser = 'jd2kkg'
                expect(() => logic.removeLikeToVinyl(idVinyl, idUser)).to.throw( ValueError, `id is empty or blank`)
            })

            it('should fail on no string id (boolean)', () => {
                const idVinyl = false    
                const idUser = 'jd2kkd'
                expect(() => logic.removeLikeToVinyl(idVinyl, idUser)).to.throw( TypeError, 'false is not a string')
            })

            it('should fail on undefined userId', () => {
                const idVinyl = 'hhh3h43h'
                const idUser = undefined
                expect(() => logic.removeLikeToVinyl(idVinyl, idUser)).to.throw( TypeError, `undefined is not a string`)
            })

            it('should fail on empty userId', () => {
                const idVinyl = 'hhh3h43h'
                const idUser = ''
                expect(() => logic.removeLikeToVinyl(idVinyl, idUser)).to.throw( ValueError, `${idUser} is empty or blank`)
            })

            it('should fail on blank userId', () => {
                const idVinyl = 'hhh3h43h'
                const idUser = '  '
                expect(() => logic.removeLikeToVinyl(idVinyl, idUser)).to.throw( ValueError, `userId is empty or blank`)
            })

            it('should fail on no string userId (boolean)', () => {
                const idVinyl = 'hhh3h43h'
                const idUser = false
                expect(() => logic.removeLikeToVinyl(idVinyl, idUser)).to.throw( TypeError, `false is not a string`)
            })


        })

        describe('is like?', () => {
            let user, vinyl
            
            beforeEach(async () => {
                user = new User({ email: 'John@jon.com', username: 'jdakk', password: '123' })

                await user.save()

                const id = user._id.toString()
                const title = 'neveghhgrmindhh'
                const artist = 'nirvgghhanahh'
                const year = 1992
                const imgVinylUrl = null
                const info = null
                const likes = [id]

                vinyl = new Vinyl({ id, title, artist, year, imgVinylUrl, info , likes })

                await vinyl.save()

            })
            

            it('should succeed on correct data', async () => {

                const idVinyl = vinyl._id.toString()
                const res = await logic.isLikes(idVinyl)


                const _vinyl = await Vinyl.findById(idVinyl)

  

                expect(_vinyl.likes.length).to.equal(1)

  
            })

            it('should fail on undefined id', () => {
                
                const idVinyl = undefined

                expect(() => logic.isLikes(idVinyl)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                const idVinyl = ''

                expect(() => logic.isLikes(idVinyl)).to.throw( ValueError, `${idVinyl} is empty or blank`)
            })

            it('should fail on blank id', () => {
                const idVinyl = '  '
                 
                expect(() => logic.isLikes(idVinyl)).to.throw( ValueError, `id is empty or blank`)
            })

            it('should fail on no string id (boolean)', () => {
                const idVinyl = false    
                 
                expect(() => logic.isLikes(idVinyl)).to.throw( TypeError, 'false is not a string')
            })


        })

        describe('add comment to vinyl', () => {
            let user, vinyl
            
            beforeEach(async () => {
                user = new User({ email: 'John@jon.com', username: 'jdakk', password: '123' })

                await user.save()

                const id = user._id.toString()
                const title = 'neveghhgrmindhh'
                const artist = 'nirvgghhanahh'
                const year = 1992
                const imgVinylUrl = null
                const info = null
                const comments = []
 

                vinyl = new Vinyl({ id, title, artist, year, imgVinylUrl, info , comments })

                await vinyl.save()

            })
            

            it('should succeed on correct data', async () => {

                const idVinyl = vinyl._id.toString()
                const id = user._id.toString()
                const text = 'fffffffffff'
                const res = await logic.addCommentToVinyl(idVinyl, id, text)

                expect(res).to.be.undefined

                const _vinyl = await Vinyl.findById(idVinyl)

  

                expect(_vinyl.comments.length).to.equal(1)

                const [commentsId] = _vinyl.comments

                expect(commentsId.username.toString()).to.equal(user.username.toString())
            })

            it('should fail on undefined idVinyl', () => {
                
                const idVinyl = undefined
                const id = 'jddd2kkf'
                const text = 'hhhhh'
                expect(() => logic.addCommentToVinyl(idVinyl, id, text)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty idVinyl', () => {
                const idVinyl = ''
                const id = 'jd2kkf'
                const text = 'hhhhh'
                expect(() => logic.addCommentToVinyl(idVinyl, id, text)).to.throw( ValueError, `${idVinyl} is empty or blank`)
            })

            it('should fail on blank idVinyl', () => {
                const idVinyl = '  '
                const id = 'jd2kkg'
                const text = 'hhhhh'
                expect(() => logic.addCommentToVinyl(idVinyl, id, text)).to.throw( ValueError, `vinylId is empty or blank`)
            })

            it('should fail on no string idVinyl (boolean)', () => {
                const idVinyl = false    
                const id = 'jd2kkd'
                const text = 'hhhhh'
                expect(() => logic.addCommentToVinyl(idVinyl, id, text)).to.throw( TypeError, 'false is not a string')
            })

            it('should fail on undefined userId', () => {
                const idVinyl = 'hhh3h43h'
                const id = undefined
                const text = 'hhhhh'
                expect(() => logic.addCommentToVinyl(idVinyl, id, text)).to.throw( TypeError, `undefined is not a string`)
            })

            it('should fail on empty userId', () => {
                const idVinyl = 'hhh3h43h'
                const id = ''
                const text = 'hhhhh'
                expect(() => logic.addCommentToVinyl(idVinyl, id, text)).to.throw( ValueError, `${id} is empty or blank`)
            })

            it('should fail on blank userId', () => {
                const idVinyl = 'hhh3h43h'
                const id = '  '
                const text = 'hhhhh'
                expect(() => logic.addCommentToVinyl(idVinyl, id, text)).to.throw( ValueError, `userId is empty or blank`)
            })

            it('should fail on no string userId (boolean)', () => {
                const idVinyl = 'hhh3h43h'
                const id = false
                const text = 'hhhhh'
                expect(() => logic.addCommentToVinyl(idVinyl, id, text)).to.throw( TypeError, `false is not a string`)
            })

            it('should fail on undefined text', () => {
                const idVinyl = 'hhh3h43h'
                const id = 'jttd2kk'
                const text = undefined
                expect(() => logic.addCommentToVinyl(idVinyl, id, text)).to.throw( TypeError, `undefined is not a string`)
            })

            it('should fail on empty text', () => {
                const idVinyl = 'hhh3h43h'
                const id = 'jdjj2kk'
                const text = ''
                expect(() => logic.addCommentToVinyl(idVinyl, id, text)).to.throw( ValueError, `${text} is empty or blank`)
            })

            it('should fail on blank text', () => {
                const idVinyl = 'hhh3h43h'
                const id = 'jd2hkk'
                const text = '  '
                expect(() => logic.addCommentToVinyl(idVinyl, id, text)).to.throw( ValueError, `text is empty or blank`)
            })

            it('should fail on no string text (boolean)', () => {
                const idVinyl = 'hhh3h43h'
                const id = 'jd2kk'
                const text = false
                expect(() => logic.addCommentToVinyl(idVinyl, id, text)).to.throw( TypeError, `false is not a string`)
            })


        })

        describe('retrieve vinyl comments', () => {
            let vinyl, user
            
            beforeEach(async () => {
                
                user = new User({ email: 'Jozzhn@ff.com', username: 'jvzzvvvd', password: '123' })

                await user.save()

                const title = 'neverm'
                const artist = 'nirvana'
                const year = 1992
                const imgVinylUrl = null
                const info = null
                const likes = []
                const comments = [{
                    "text" : "Very cool man :)",
                    "username" : "jvzzvvvd",
                    "imgProfileUrl" : "https://res.cloudinary.com/dmp64syaz/image/upload/v1542723040/vinyls/ssie6uwcpfmxezf2pvej.jpg"
                }]

                vinyl = new Vinyl({ id:user._id, title, artist, year, imgVinylUrl, info, likes, comments })


                await vinyl.save()

            })
            

            it('should succeed on correct data', async () => {
                const idVinyl = vinyl._id.toString()
               

                const _comments = await logic.retrieveVinylComments(idVinyl)


                expect(_comments.length).to.equal(1)
                expect(_comments[0].username).to.equal(user.username)


            })

            it('should fail on undefined id', () => {
                expect(() => logic.retrieveVinylComments(undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                expect(() => logic.retrieveVinylComments('')).to.throw(ValueError, 'id is empty or blank')
            })

            it('should fail on blank id', () => {
                expect(() => logic.retrieveVinylComments('   \t\n')).to.throw(ValueError, 'id is empty or blank')
            })

            it('should fail on boolean id', () => {
                expect(() => logic.retrieveVinylComments(false)).to.throw(TypeError, 'false is not a string')
            })


        })
    })

    

    after(() => mongoose.disconnect())
})