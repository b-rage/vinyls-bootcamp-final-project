//import logic from './logic'
const { mongoose, models: { User, Vinyl} } = require('vinyls-data')

require('dotenv').config()

const logic = require('./logic')
const { expect } = require('chai')
require('isomorphic-fetch')
global.sessionStorage = require('sessionstorage')
const fs = require('fs')

const MONGO_URL = process.env.REACT_APP_MONGO_URL
logic.url = process.env.REACT_APP_API_URL

// const MONGO_URL = 'mongodb://localhost:27017/vinyls-test'
// logic.url = 'http://localhost:5000/api'
// logic.url = 'http://192.168.0.82:5000' // DEV server!


// running test from CLI
// normal -> $ mocha src/logic.spec.js --timeout 1000
// debug -> $ mocha debug src/logic.spec.js --timeout 10000

describe('logic', () => {
    before(() => mongoose.connect(MONGO_URL, { useNewUrlParser: true, useCreateIndex: true }))

    beforeEach(() => Promise.all([User.deleteMany(), Vinyl.deleteMany()]))

    describe('users', () => {
        
        describe('register', () => {
            it('should succeed on correct data', () =>
                logic.registerUser(`jd-${Math.random()}n@jon.com`, `jd-${Math.random()}`, '123')
                    .then(() => expect(true).to.be.true)
            )

            it('should fail on trying to register twice same username', () => {
                const email = `jd-${Math.random()}n@jon.com`
                const username = 'JohnDoe'

                return logic.registerUser(email, username, '123')
                    .then(() => logic.registerUser(`jd-${Math.random()}n@jon.com`, username, '123'))
                    .catch(err => {
                        expect(err).not.to.be.undefined
                        expect(err.message).to.equal(`username ${username} already registered`)
                        expect(err.message).to.equal(`username ${username} already registered`)
                    })
            })

            it('should fail on undefined email', () => {
                expect(() =>
                    logic.registerUser(undefined, 'jd', '123')
                ).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on undefined username', () => {
                expect(() =>
                    logic.registerUser('doe@gmail.com', undefined, '123')
                ).to.throw(TypeError, 'undefined is not a string')
            })


            it('should fail on empty username', () => {
                expect(() =>
                    logic.registerUser(`doe${Math.random()}@gmail.com`, '', '123')
                ).to.throw(Error, 'name is empty or blank')
            })

            it('should fail on empty email', () => {
                expect(() =>
                    logic.registerUser(`jd-${Math.random()}`, 'jon', '123')
                ).to.throw(Error, ' is an invalid email')
            })

            it('should fail on no @ sign', () => {
                expect(() =>
                    logic.registerUser(`jd-${Math.random()}`, 'don', '123')
                ).to.throw(Error, ' is an invalid email')
            })

            it('should fail on no .com', () => {
                expect(() =>
                    logic.registerUser(`jd-${Math.random()}`, 'dop', '123')
                ).to.throw(Error, ' is an invalid email')
            })
        })

        describe('login', () => {
            describe('with existing user', () => {
                let username, password

                beforeEach(() => {
                   
                    email = `jd-${Math.random()}@gmail.com`
                    username = `jd-${Math.random()}`
                    password = `123-${Math.random()}`

                    return logic.registerUser(email, username, password)
                })

                it('should succeed on correct data', () =>
                    logic.login(username, password)
                        .then(() => expect(true).to.be.true)
                )

                it('should fail on wrong username', () => {
                    username = `dummy-${Math.random()}`

                    return logic.login(username, password)
                        .catch(err => {
                            expect(err).not.to.be.undefined
                            expect(err.message).to.equal(`invalid username or password`)
                        })
                })

                it('should fail on wrong password', () => {
                    password = 'pepito'

                    return logic.login(username, password)
                        .catch(err => {
                            expect(err).not.to.be.undefined
                            expect(err.message).to.equal('invalid username or password')
                        })
                })
            })

            it('should fail on undefined username', () => {
                const username = undefined

                expect(() =>
                    logic.login(username, '123')
                ).to.throw(Error, `${username} is not a string`)
            })

            it('should fail on boolean username', () => {
                const username = true

                expect(() =>
                    logic.login(username, '123')
                ).to.throw(Error, `${username} is not a string`)
            })

            it('should fail on numeric username', () => {
                const username = 123

                expect(() =>
                    logic.login(username, '123')
                ).to.throw(Error, `${username} is not a string`)
            })

            // TODO other cases
        })

        describe('logout', () => {
            let email, username, password

            beforeEach(async () => {
                email = `jd-${Math.random()}@gmail.com`
                username = `u-${Math.random()}`
                password = `p-${Math.random()}`

                await logic.registerUser(email, username, password)
                await logic.login(username, password)
            })

            it('should succeed on correct data', async () => {
                const res = await logic.logout()

                expect(res).to.be.undefined
            })

            // TODO other test cases
        })

        describe('retrieve user by id', () => {
            let user
            
            beforeEach(async () => {

                user = new User({ email: 'Jddohnm@jon.com', username: 'jdmssddakk', password: '123' })

                await user.save()
                await logic.login('jdmssddakk', '123')
            })
            

            it('should succeed on correct data', async () => {

                const userId = logic._userId
                
                const _user = await logic.retrieveUserById(userId)

                const { email, username, idUser } = _user

                expect(_user).not.to.be.instanceof(User)

                expect(idUser).to.exist
               
                expect(idUser).to.be.a('string')
                expect(idUser).to.equal(_user.idUser)
                expect(_user.email).to.equal(email)
                expect(_user.username).to.equal(username)
            })

            it('should fail on undefined id', () => {
                expect(() => logic.retrieveUserById(undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                expect(() => logic.retrieveUserById('')).to.throw(Error, 'id is empty or blank')
            })

            it('should fail on blank id', () => {
                expect(() => logic.retrieveUserById('   \t\n')).to.throw(Error, 'id is empty or blank')
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
            

            it('should succeed on correct data', async () => {
                const _users = await logic.retrieveGalleryUsers()

                expect(_users.length).to.equal(2)

            })

        })

        describe('retrieve all users', () => {
            let user
            
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


        })

        describe('update user', () => {
            let user



            beforeEach(async () => {
                
                user = new User({ email: 'John@jon.com', username: 'jd', password: '123' })


                await user.save()
                await logic.login('jd', '123')

            })

            it('should update on correct data and password', async () => {
                const { username, password, newPassword, imgProfileUrl, bio} = user

                const newUsername = `${username}-${Math.random()}`
                const newImgProfileUrl = `${imgProfileUrl}-${Math.random()}`
                const newBio = `${bio}-${Math.random()}`

     
                const res = await logic.modifyUser( newUsername, password, null, newImgProfileUrl, newBio)

                expect(res).to.be.undefined

                const _users = await User.find().lean()

                const [_user] = _users

                //expect(_user.id.toString()).to.equal(id.toString())

                expect(_user.imgProfileUrl).to.equal(newImgProfileUrl)
                expect(_user.bio).to.equal(newBio)
                expect(_user.username).to.equal(newUsername)

            })

            it('should update on correct id and password, change username (other fields null)', async () => {
                const {  username, password, imgProfileUrl, bio } = user

                const newUsername = `${username}-${Math.random()}`

                const res = await logic.modifyUser( newUsername, password, null, null, null)

                expect(res).to.be.undefined

                const _users = await User.find()

                const [_user] = _users

                expect(_user.username).to.equal(newUsername)
                expect(_user.password).to.equal(password)
            })

            it('should update on correct id and username, change password (other fields null)', async () => {
                const {  username, password, imgProfileUrl, bio } = user

                const newPassword = `${password}-${Math.random()}`

                const res = await logic.modifyUser( username, password, newPassword, null, null)

                expect(res).to.be.undefined

                const _users = await User.find()

                const [_user] = _users


                expect(newPassword).to.be.a('string')
                expect(_user.username).to.equal(username)
                expect(_user.password).to.equal(newPassword)
            })

            it('should update on correct  username and password, adding profile photo (other fields null)', async () => {
                const {  username, password, imgProfileUrl, bio  } = user

                const newImgProfileUrl = `${imgProfileUrl}-${Math.random()}`

                const res = await logic.modifyUser( username, password, null, newImgProfileUrl, null)

                expect(res).to.be.undefined

                const _users = await User.find()

                const [_user] = _users

                expect(newImgProfileUrl).to.be.a('string')
                expect(_user.username).to.equal(username)
                expect(_user.password).to.equal(password)
                expect(_user.imgProfileUrl).to.equal(newImgProfileUrl)
            })

            it('should update on correct  username and password, adding bio (other fields null)', async () => {
                const {  username, password, imgProfileUrl, bio  } = user

                const newBio = `${bio}-${Math.random()}`

                const res = await logic.modifyUser( username, password, null, null, newBio)

                expect(res).to.be.undefined

                const _users = await User.find()

                const [_user] = _users

                expect(newBio).to.be.a('string')
                expect(_user.username).to.equal(username)
                expect(_user.password).to.equal(password)
                expect(_user.bio).to.equal(newBio)
            })


            it('should update on correct  username and password, adding bio and photo profile', async () => {
                const {  username, password, imgProfileUrl, bio  } = user

                const newBio = `${bio}-${Math.random()}`
                const newImgProfileUrl = `${imgProfileUrl}-${Math.random()}`

                const res = await logic.modifyUser( username, password, null, newImgProfileUrl, newBio)

                expect(res).to.be.undefined

                const _users = await User.find()

                const [_user] = _users

                expect(newBio).to.be.a('string')
                expect(newImgProfileUrl).to.be.a('string')
                expect(_user.username).to.equal(username)
                expect(_user.password).to.equal(password)
                expect(_user.imgProfileUrl).to.equal(newImgProfileUrl)
                expect(_user.bio).to.equal(newBio)
            })

            it('should update on correct  username and password, adding new password, bio and photo profile', async () => {
                const {  username, password, imgProfileUrl, bio  } = user

                const newBio = `${bio}-${Math.random()}`
                const newImgProfileUrl = `${imgProfileUrl}-${Math.random()}`
                const newPassword = `${password}-${Math.random()}`

                const res = await logic.modifyUser( username, password, newPassword, newImgProfileUrl, newBio)

                expect(res).to.be.undefined

                const _users = await User.find()

                const [_user] = _users


                expect(newBio).to.be.a('string')
                expect(newImgProfileUrl).to.be.a('string')
                expect(newPassword).to.be.a('string')
                expect(_user.username).to.equal(username)
                expect(_user.password).to.equal(newPassword)
                expect(_user.imgProfileUrl).to.equal(newImgProfileUrl)
                expect(_user.bio).to.equal(newBio)
            })


        describe('with existing user', () => {
                let user, user2

   
                beforeEach(async () => {
                
                    user = new User({ email: 'Jojjhn@jon.com', username: 'jkkd', password: '123' })
                    user2 = new User({ email: 'Jjjojjhn@jon.com', username: 'jkk2', password: '123' })
    
    
                    await user.save()
                    await user2.save()
                    await logic.login('jd', '123')
    
                })

                it('should fail on existing username', async () => {
                    const { password, imgProfileUrl, bio } = user

                    const newUsername = 'jkkd'


                    try {
                        await logic.modifyUser(newUsername, '123', imgProfileUrl, bio)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`username ${newUsername} already exists`)
                    }

                })
            })
        })

        describe('search users', () => {
            let user
            
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

        })

        describe('add follow', () => {
            let user, user2, user3, user4
            
            beforeEach(async () => {
                user = new User({ email: 'Joghn@jon.com', username: 'jdakk', password: '123' })
                user2 = new User({ email: 'Jogh2n@jon.com', username: 'jd2kk', password: '1232' })
                user3 = new User({ email: 'Jogh3n@jon.com', username: 'jd3akk', password: '1233' })
                user4 = new User({ email: 'Jogh2n4@jon.com', username: 'jd24kk', password: '12342' })


                await user.save()
                await user2.save()
                await user3.save()
                await user4.save()

                await logic.login('jdakk', '123')
            })
            

            it('should succeed on correct data', async () => {
                const res = await logic.addFollow(user2.username)

                expect(res).to.be.undefined

                const _user = await User.findById(user.id)

                expect(_user.id).to.equal(user.id)

                expect(_user.follows.length).to.equal(1)

                const [followId] = _user.follows

                expect(followId.toString()).to.equal(user2.id)
            })


            it('should fail on empty followUsername', () => {
                const followUsername = ''

                expect(() => logic.addFollow(followUsername)).to.throw( Error, `${followUsername} is empty or blank`)
            })

            it('should fail on blank followUsername', () => {
                const followUsername = '  '

                expect(() => logic.addFollow(followUsername)).to.throw( Error, `followUsername is empty or blank`)
            })

            it('should fail on undefined followUsername', () => {
                const followUsername = undefined

                expect(() => logic.addFollow(followUsername)).to.throw( Error, `undefined is not a string`)
            })

            it('should fail on boolean followUsername', () => {
                const followUsername = true

                expect(() => logic.addFollow(followUsername)).to.throw( Error, `true is not a string`)
            })


        })

        describe('remove follow', () => {
            let user, user2
            
            beforeEach(async () => {
                user = new User({ email: 'Johnm@jon.com', username: 'jdmakk', password: '123' })
                user2 = new User({ email: 'Johm2n@jon.com', username: 'jdm2kk', password: '1232' })

                user.follows.length = 1
                user.follows[0] = user2.id

                await user.save()
                await user2.save()

                await logic.login('jdmakk', '123')

            })
            

            it('should succeed on correct data', async () => {

                const [followId] = user.follows

                expect(followId.toString()).to.equal(user2.id)

                const res = await logic.removeFollow(user2.username)

                expect(res).to.be.undefined

                const _user = await User.findById(user.id)

                expect(_user.id).to.equal(user.id)

                expect(_user.follows.length).to.equal(0)

                
            })

            

            it('should fail on empty followUsername', () => {
                const followUsername = ''
                
                expect(() => logic.removeFollow(followUsername)).to.throw( Error, `${followUsername} is empty or blank`)
            })

            it('should fail on blank followUsername', () => {
                const followUsername = '  '
                
                expect(() => logic.removeFollow(followUsername)).to.throw( Error, `followUsername is empty or blank`)
            })

            it('should fail on undefined followUsername', () => {
                const followUsername = undefined

                expect(() => logic.addFollow(followUsername)).to.throw( Error, `undefined is not a string`)
            })

            it('should fail on boolean followUsername', () => {
                const followUsername = true

                expect(() => logic.addFollow(followUsername)).to.throw( Error, `true is not a string`)
            })


        })

        describe('is follow?', () => {
            let user, user2
            
            beforeEach(async () => {
                user = new User({ email: 'Johnm@jon.com', username: 'jdmhakk', password: '123' })
                user2 = new User({ email: 'Johm2n@jon.com', username: 'jdmh2kk', password: '1232' })

                user.follows.length = 1

                await user.save()
                await user2.save()

                await logic.login('jdmhakk', '123')

            })
            

            it('should succeed on correct data', async () => {

                await logic.itsInFollows(user2.id)

                const _user = await User.findById(user.id)

                expect(_user.follows.length).to.equal(1)
  

                
            })

            it('should fail on undefined id', () => {
                
                const id = undefined
                expect(() => logic.itsInFollows(id)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                const id = ''
                expect(() => logic.itsInFollows(id)).to.throw(Error, `id is empty or blank`)
            })

            it('should fail on blank id', () => {
                const id = '  '
                expect(() => logic.itsInFollows(id)).to.throw(Error, `id is empty or blank`)
            })

            it('should fail on no string id (boolean)', () => {
                const id = false    
                expect(() => logic.itsInFollows(id)).to.throw( Error, 'false is not a string')
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

                await logic.login('jdmakk', '123')

            })
            

            it('should succeed on correct data', async () => {

                const res = await logic.retrieveFollowsListUser()

                const _user = await User.findById(user.id)

                expect(_user.follows.length).to.equal(1)

                
            })

 

        })

        describe('retrieve List Vinyls Followees', () => {
            let user
            
            beforeEach(async () => {
                user = new User({ email: 'Johnm@jon.com', username: 'jdmakk', password: '123' })

                user.follows.length = 1
                user.followers.length = 2

  
                await user.save()

                await logic.login('jdmakk', '123')

            })
            

            it('should succeed on correct data', async () => {

                await logic.retrieveFolloweesListVinyls()

                
                const _user = await User.findById(user._id).lean()

                let follows = _user.follows

                expect(follows.length).to.equal(1)

                
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

                await logic.login('jdmddakk', '123')

            })
            

            it('should succeed on correct data', async () => {

                const res = await logic.retrieveFollowersListUser()

                const foll = user2.followers[0]

                expect(foll).to.equal(user.id)

                
            })


        })

        false && describe('add profile pictures ', ()=> {
            let user
            beforeEach(async () => {
                username = 'John'

                email = `jd-${Math.random()}@example.com`
                password = `jd-${Math.random()}`

                user = new User({ email, username, password })

                return user.save()

                await logic.login(username, password)

            })
            it('should succed on correct data', async () => {
 
                let image = './data/test-images/icon-profile.png'

                var file = fs.createReadStream(image)

                const res = await logic.uploadImgProfile(file)

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

                var file = fs.createReadStream(image)
                const id = undefined
                expect(() => logic.uploadImgProfile(file)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                let image = './data/test-images/icon-profile.png'

                var file = fs.createReadStream(image)
                const id = ''
                expect(() => logic.uploadImgProfile(file)).to.throw( Error, `${id} is empty or blank`)
            })

            it('should fail on blank id', () => {
                let image = './data/test-images/icon-profile.png'

                var file = fs.createReadStream(image)
                const id = '  '
                expect(() => logic.uploadImgProfile(file)).to.throw( Error, `userId is empty or blank`)
            })

            it('should fail on no string id (boolean)', () => {
                let image = './data/test-images/icon-profile.png'

                var file = fs.createReadStream(image)
                const id = false    
                expect(() => logic.uploadImgProfile(file)).to.throw( TypeError, 'false is not a string')
            })
        }) 

        describe('connected user', () => {
            let user
            
            beforeEach(async () => {
                user = new User({ email: 'John@jon.com', username: 'jdakk', password: '123' })
            
                await user.save()

                await logic.login('jdakk', '123')
     
            })
            

            it('should succeed on correct data', async () => {


                const res = await logic.onlineUser()

                const _user = await User.findById(user.id)

                expect(_user.id).to.equal(user.id)

                expect(_user.connection).to.equal('online')

       
            })     

        })

        describe('disconnected user', () => {
            let user
            
            beforeEach(async () => {
                user = new User({ email: 'John@jon.com', username: 'jdakk', password: '123' })
            
                await user.save()

                await logic.login('jdakk', '123')
     
            })
            

            it('should succeed on correct data', async () => {


                const res = await logic.offlineUser()

                const _user = await User.findById(user.id)

                expect(_user.id).to.equal(user.id)

                expect(_user.connection).to.equal('offline')

       
            }) 

        })
    })

    describe('vinyls', () => {
        describe('add Vinyl', () => {
            let user
            beforeEach(async () => {

                user = new User({ email: 'John@ff.com', username: 'jvvvvd', password: '123' })

                await user.save()

                await logic.login('jvvvvd', '123')

            })

            it('should succeed on correct data', async () => {

                const id = user.id
                const title = 'neverm'
                const artist = 'nirvana'
                const year = '1992'
                const imgVinylUrl = null
                const info = null


                const res = await logic.addVinyl( title, artist, year, imgVinylUrl, info )

                expect(res).not.to.be.undefined

                const vinyls = await Vinyl.find().lean()

                const [vinyl] = vinyls


                expect(vinyl.title).to.equal(title)
                expect(vinyl.artist).to.equal(artist)
                expect(vinyl.year).to.equal(year)

                expect(vinyl.id.toString()).to.equal(user._id.toString())
            })


            it('should fail on undefined title', () => {
                
                const id = user.id
                const title = undefined
                const artist = 'nirvana'
                const year = '1992'
                const imgVinylUrl = null
                const info = null
                expect(() => logic.addVinyl( title, artist, year, imgVinylUrl, info )).to.throw(TypeError, 'undefined is not a string')
            })


            it('should fail on empty title', () => {
                const id = user.id
                const title = ''
                const artist = 'nirvan3a'
                const year = '1992'
                const imgVinylUrl = null
                const info = null
                expect(() => logic.addVinyl( title, artist, year, imgVinylUrl, info )).to.throw( TypeError, `title is empty or blank`)
            })

            it('should fail on blank title', () => {
                const id = user.id
                const title = '  '
                const artist = 'nirrvana'
                const year = '1992'
                const imgVinylUrl = null
                const info = null
                expect(() => logic.addVinyl( title, artist, year, imgVinylUrl, info )).to.throw( TypeError, `title is empty or blank`)
            })

            it('should fail on no string title (boolean)', () => {
                const id = user.id
                const title = false
                const artist = 'nrirvana'
                const year = '1992'
                const imgVinylUrl = null
                const info = null   
                expect(() => logic.addVinyl( title, artist, year, imgVinylUrl, info )).to.throw( TypeError, 'false is not a string')
            })

            it('should fail on undefined artist', () => {
                
                const id = user.id
                const title = 'nevs'
                const artist = undefined
                const year = '1992'
                const imgVinylUrl = null
                const info = null
                expect(() => logic.addVinyl( title, artist, year, imgVinylUrl, info )).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty artist', () => {
                const id = user.id
                const artist = ''
                const title = 'nirvaxn3a'
                const year = '1992'
                const imgVinylUrl = null
                const info = null
                expect(() => logic.addVinyl( title, artist, year, imgVinylUrl, info )).to.throw( TypeError, `artist is empty or blank`)
            })

            it('should fail on blank artist', () => {
                const id = user.id
                const artist = '  '
                const title = 'nirrvxana'
                const year = '1992'
                const imgVinylUrl = null
                const info = null
                expect(() => logic.addVinyl( title, artist, year, imgVinylUrl, info )).to.throw( TypeError, `artist is empty or blank`)
            })

            it('should fail on no string artist (boolean)', () => {
                const id = user.id
                const artist = false
                const title = 'nrirxvana'
                const year = '1992'
                const imgVinylUrl = null
                const info = null   
                expect(() => logic.addVinyl( title, artist, year, imgVinylUrl, info )).to.throw( TypeError, 'false is not a string')
            })

            it('should fail on undefined year', () => {
                const id = user.id
                const artist = 'nirv'
                const title = 'nirvaxn3a'
                const year = undefined
                const imgVinylUrl = null
                const info = null
                expect(() => logic.addVinyl( title, artist, year, imgVinylUrl, info )).to.throw( TypeError, `undefined is not a number`)
            })

            it('should fail on no string year (boolean)', () => {
                const id = user.id
                const artist = 'nirv'
                const title = 'nrirxvana'
                const year = false
                const imgVinylUrl = null
                const info = null   
                expect(() => logic.addVinyl( title, artist, year, imgVinylUrl, info )).to.throw( TypeError, 'false is not a number')
            })
        })

        false && describe('add vinyl picture ',  ()=> {
            let user, vinyl
            beforeEach( async () => {
                username = 'John'

                email = `jd-${Math.random()}@example.com`
                password = `jd-${Math.random()}`

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

  
        })

        describe('retrieve all vinyls', () => {
            let vinyl, user
            
            beforeEach(async () => {
                
                user = new User({ email: 'John@ff.com', username: 'jvvvvd', password: '123' })

                await user.save()

                await logic.login('jvvvvd', '123')

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

                await logic.login('jvzzvvvd', '123')

                const title = 'neverm'
                const artist = 'nirvana'
                const year = '1992'
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
                expect(() => logic.retrieveVinylById('')).to.throw(Error, 'id is empty or blank')
            })

            it('should fail on blank id', () => {
                expect(() => logic.retrieveVinylById('   \t\n')).to.throw(Error, 'id is empty or blank')
            })

            it('should fail on boolean id', () => {
                expect(() => logic.retrieveVinylById(false)).to.throw(TypeError, 'false is not a string')
            })


        })

        describe('retrieve vinyl by user id', () => {
            let vinyl, user
            
            beforeEach(async () => {
                
                user = new User({ email: 'Jozzhn@ff.com', username: 'jvzzvvvd', password: '123' })

                await user.save()

                await logic.login('jvzzvvvd', '123')

                const id = user._id
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
                expect(() => logic.retrieveVinylsByUserId('')).to.throw(Error, 'id is empty or blank')
            })

            it('should fail on blank id', () => {
                expect(() => logic.retrieveVinylsByUserId('   \t\n')).to.throw(Error, 'id is empty or blank')
            })

            it('should fail on boolean id', () => {
                expect(() => logic.retrieveVinylsByUserId(false)).to.throw(TypeError, 'false is not a string')
            })


        })

        describe('search vinyls', () => {
            let vinyl, user
            
            beforeEach(async () => {

                user = new User({ email: 'Jozzhn@ff.com', username: 'jvzzvvvd', password: '123' })

                await user.save()
                const id = user._id

                await logic.login('jvzzvvvd', '123')

                const artist = 'nirvana'
                const year = 1992
                const imgVinylUrl = null
                const info = null

                vinyl = new Vinyl({ id, title: 'ngitvana', artist, year, imgVinylUrl, info  })
                vinyl2 = new Vinyl({ id, title: 'gggg', artist, year, imgVinylUrl, info  })
                vinyl3 = new Vinyl({ id, title: 'gggggh', artist, year, imgVinylUrl, info  })
                vinyl4 = new Vinyl({ id, title: 'gggggh', artist, year, imgVinylUrl, info  })


                await vinyl.save()
                await vinyl2.save()
                await vinyl3.save()
                await vinyl4.save()
            })
            

            it('should succeed on correct data', async () => {
                const query = 'g'
                const _vinyls = await logic.searchListVinyls(query)

                expect(_vinyls.length).to.equal(4)

            })

            it('should succeed on correct data', async () => {
                const query = 'h'
                const _vinyls = await logic.searchListVinyls(query)

                expect(_vinyls.length).to.equal(2)

            })

            it('should fail on undefined query', () => {
                const query = undefined

                expect(() => logic.searchListVinyls(query)).to.throw(Error, 'undefined is not a string')
            })

            it('should fail on no string query (boolean)', () => {
                const query = false

                expect(() => logic.searchListVinyls(query)).to.throw( Error, 'false is not a string')
            })


        })

        describe('remove vinyl', () => {
            let vinyl, user
            
            beforeEach(async () => {

                user = new User({ email: 'Jozzhn@ff.com', username: 'jvzzvvvd', password: '123' })

                await user.save()

                await logic.login('jvzzvvvd', '123')

                const id = user._id
                const title = 'nevermindhh'
                const artist = 'nirvanahh'
                const year = '1992'
                const imgVinylUrl = null
                const info = null

                vinyl = new Vinyl({ id, title, artist, year, imgVinylUrl, info  })

                await vinyl.save()

            })
            

            it('should succeed on correct data', async () => {

                const vinylId= vinyl._id.toString()

                const res = await logic.deleteVinyl(vinylId)

                expect(res).to.be.undefined

                const _vinyls = await Vinyl.find()

                expect(_vinyls.length).to.equal(0)

            })


            it('should fail on undefined id', () => {
                const vinylId = undefined

                expect(() => logic.deleteVinyl(vinylId)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                const vinylId = ''

                expect(() => logic.deleteVinyl(vinylId)).to.throw( Error, `${vinylId} is empty or blank`)
            })

            it('should fail on blank id', () => {
                const vinylId = '  '

                expect(() => logic.deleteVinyl(vinylId)).to.throw( Error, `id is empty or blank`)
            })

            it('should fail on no string id (boolean)', () => {
                const vinylId = false

                expect(() => logic.deleteVinyl(vinylId)).to.throw( TypeError, 'false is not a string')
            })


        })

        describe('edit vinyl', () => {
            let vinyl, user
            
            beforeEach(async () => {

                user = new User({ email: 'Jozzhn@ff.com', username: 'jvzzvvvd', password: '123' })

                await user.save()

                const id = user._id.toString()

                await logic.login('jvzzvvvd', '123')

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


                const res = await logic.modifyVinyl( vinylId, newTitle, newArtist, newYear, newimgVinylUrl, newInfo)

                expect(res).to.be.undefined

                const _vinyls = await Vinyl.find()

                const [ _vinyl ] = _vinyls


                expect(_vinyl.title).to.equal(newTitle)
                expect(_vinyl.artist).to.equal(newArtist)
                expect(_vinyl.year).to.equal(newYear)
            })

            


            it('should fail on undefined id', () => {
                const {newTitle, newArtist, newYear, newimgVinylUrl, newInfo } = vinyl

                expect(() => logic.modifyVinyl( undefined, newTitle, newArtist, newYear, newimgVinylUrl, newInfo)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                const {newTitle, newArtist, newYear, newimgVinylUrl, newInfo } = vinyl

                expect(() => logic.modifyVinyl( '', newTitle, newArtist, newYear, newimgVinylUrl, newInfo)).to.throw(Error, 'id is empty or blank')
            })

            it('should fail on blank id', () => {
                const {newTitle, newArtist, newYear, newimgVinylUrl, newInfo } = vinyl

                expect(() => logic.modifyVinyl( '  ', newTitle, newArtist, newYear, newimgVinylUrl, newInfo)).to.throw(Error, 'id is empty or blank')
            })

            it('should fail on no string id (boolean)', () => {
                const {newTitle, newArtist, newYear, newimgVinylUrl, newInfo } = vinyl

                expect(() => logic.modifyVinyl( false, newTitle, newArtist, newYear, newimgVinylUrl, newInfo)).to.throw(TypeError, 'false is not a string')
            })

        })

        describe('add like to vinyl', () => {
            let user, vinyl
            
            beforeEach(async () => {
                user = new User({ email: 'John@jon.com', username: 'jdakk', password: '123' })

                await user.save()

                const id = user._id.toString()

                await logic.login('jdakk', '123')

                const title = 'neveghhgrmindhh'
                const artist = 'nirvgghhanahh'
                const year = '1992'
                const imgVinylUrl = null
                const info = null
                const likes = []

                vinyl = new Vinyl({ id, title, artist, year, imgVinylUrl, info , likes })

                await vinyl.save()

            })
            

            it('should succeed on correct data', async () => {

                const idVinyl = vinyl._id.toString()
                const id = user._id.toString()
                const res = await logic.addLike(idVinyl)

                expect(res).to.be.undefined

                const _vinyl = await Vinyl.findById(idVinyl)

  

                expect(_vinyl.likes.length).to.equal(1)

                const [likesId] = _vinyl.likes

                expect(likesId.toString()).to.equal(vinyl.id.toString())
            })

            it('should fail on undefined id', () => {
                
                const idVinyl = undefined
                const idUser = 'jd2kk'
                expect(() => logic.addLike(idVinyl)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                const idVinyl = ''
                const idUser = 'jd2kkf'
                expect(() => logic.addLike(idVinyl)).to.throw( Error, `${idVinyl} is empty or blank`)
            })

            it('should fail on blank id', () => {
                const idVinyl = '  '
                const idUser = 'jd2kkg'
                expect(() => logic.addLike(idVinyl)).to.throw( Error, `id is empty or blank`)
            })

            it('should fail on no string id (boolean)', () => {
                const idVinyl = false    
                const idUser = 'jd2kkd'
                expect(() => logic.addLike(idVinyl)).to.throw( TypeError, 'false is not a string')
            })

            


        })

        describe('remove like to vinyl', () => {
            let user, vinyl
            
            beforeEach(async () => {
                user = new User({ email: 'John@jon.com', username: 'jdakk', password: '123' })

                await user.save()

                const id = user._id.toString()

                await logic.login('jdakk', '123')

                const title = 'neveghhgrmindhh'
                const artist = 'nirvgghhanahh'
                const year = '1992'
                const imgVinylUrl = null
                const info = null
                const likes = [id]

                vinyl = new Vinyl({ id, title, artist, year, imgVinylUrl, info , likes })

                await vinyl.save()

            })
            

            it('should succeed on correct data', async () => {

                const idVinyl = vinyl._id.toString()
                const res = await logic.removeLike(idVinyl)

                expect(res).to.be.undefined

                const _vinyl = await Vinyl.findById(idVinyl)

  

                expect(_vinyl.likes.length).to.equal(0)

  
            })

            it('should fail on undefined id', () => {
                
                const idVinyl = undefined

                expect(() => logic.removeLike(idVinyl)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                const idVinyl = ''

                expect(() => logic.removeLike(idVinyl)).to.throw( Error, `${idVinyl} is empty or blank`)
            })

            it('should fail on blank id', () => {
                const idVinyl = '  '

                expect(() => logic.removeLike(idVinyl)).to.throw( Error, `id is empty or blank`)
            })

            it('should fail on no string id (boolean)', () => {
                const idVinyl = false    

                expect(() => logic.removeLike(idVinyl)).to.throw( TypeError, 'false is not a string')
            })

            


        })

        describe('is like?', () => {
            let user, vinyl
            
            beforeEach(async () => {
                user = new User({ email: 'John@jon.com', username: 'jdakk', password: '123' })

                await user.save()

                const id = user._id.toString()

                await logic.login('jdakk', '123')

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
                const res = await logic.itsInLikes(idVinyl)


                const _vinyl = await Vinyl.findById(idVinyl)

  

                expect(_vinyl.likes.length).to.equal(1)

  
            })

            it('should fail on undefined id', () => {
                
                const idVinyl = undefined

                expect(() => logic.itsInLikes(idVinyl)).to.throw(Error, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                const idVinyl = ''

                expect(() => logic.itsInLikes(idVinyl)).to.throw( Error, `${idVinyl} is empty or blank`)
            })

            it('should fail on blank id', () => {
                const idVinyl = '  '
                 
                expect(() => logic.itsInLikes(idVinyl)).to.throw( Error, `id is empty or blank`)
            })

            it('should fail on no string id (boolean)', () => {
                const idVinyl = false    
                 
                expect(() => logic.itsInLikes(idVinyl)).to.throw( Error, 'false is not a string')
            })


        })

        describe('add comment to vinyl', () => {
            let user, vinyl
            
            beforeEach(async () => {
                user = new User({ email: 'John@jon.com', username: 'jdakk', password: '123' })

                await user.save()

                const id = user._id.toString()

                await logic.login('jdakk', '123')
                
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
                const res = await logic.addComment(idVinyl, text)

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
                expect(() => logic.addComment(idVinyl, text)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty idVinyl', () => {
                const idVinyl = ''
                const id = 'jd2kkf'
                const text = 'hhhhh'
                expect(() => logic.addComment(idVinyl, text)).to.throw( Error, `id is empty or blank`)
            })

            it('should fail on blank idVinyl', () => {
                const idVinyl = '  '
                const id = 'jd2kkg'
                const text = 'hhhhh'
                expect(() => logic.addComment(idVinyl, text)).to.throw( Error, `id is empty or blank`)
            })

            it('should fail on no string idVinyl (boolean)', () => {
                const idVinyl = false    
                const id = 'jd2kkd'
                const text = 'hhhhh'
                expect(() => logic.addComment(idVinyl, text)).to.throw( TypeError, 'false is not a string')
            })

            it('should fail on undefined text', () => {
                const idVinyl = 'hhh3h43h'
                const id = 'jttd2kk'
                const text = undefined
                expect(() => logic.addComment(idVinyl, text)).to.throw( TypeError, `undefined is not a string`)
            })

            it('should fail on empty text', () => {
                const idVinyl = 'hhh3h43h'
                const id = 'jdjj2kk'
                const text = ''
                expect(() => logic.addComment(idVinyl, text)).to.throw( Error, `${text} is empty or blank`)
            })

            it('should fail on blank text', () => {
                const idVinyl = 'hhh3h43h'
                const id = 'jd2hkk'
                const text = '  '
                expect(() => logic.addComment(idVinyl, text)).to.throw( Error, `text is empty or blank`)
            })

            it('should fail on no string text (boolean)', () => {
                const idVinyl = 'hhh3h43h'
                const id = 'jd2kk'
                const text = false
                expect(() => logic.addComment(idVinyl, text)).to.throw( TypeError, `false is not a string`)
            })


        })

        describe('retrieve vinyl comments', () => {
            let vinyl, user
            
            beforeEach(async () => {
                
                user = new User({ email: 'Jozzhn@ff.com', username: 'jvzzvvvd', password: '123' })

                await user.save()

                await logic.login('jvzzvvvd', '123')

                const title = 'neverm'
                const artist = 'nirvana'
                const year = '1992'
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
               

                const _comments = await logic.retrieveComments(idVinyl)


                expect(_comments.length).to.equal(1)
                expect(_comments[0].username).to.equal(user.username)


            })

            it('should fail on undefined id', () => {
                expect(() => logic.retrieveComments(undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                expect(() => logic.retrieveComments('')).to.throw(Error, 'id is empty or blank')
            })

            it('should fail on blank id', () => {
                expect(() => logic.retrieveComments('   \t\n')).to.throw(Error, 'id is empty or blank')
            })

            it('should fail on boolean id', () => {
                expect(() => logic.retrieveComments(false)).to.throw(TypeError, 'false is not a string')
            })


        })

    })

    after(() => mongoose.disconnect())

})

