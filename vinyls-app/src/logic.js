
// global.sessionStorage = require('sessionstorage')


const logic = {

    _userId: sessionStorage.getItem('userId') || null,
    _token: sessionStorage.getItem('token') || null,
    _connected: 'online',


    url: 'NO-URL',

     /**
     * Register User
     * @param {string} email The user email
     * @param {string} username The user username
     * @param {string} password The user password
     *  
     * @throws {TypeError} On non-string email or username or password 
     * @throws {Error} On empty or blank email, username, password
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    registerUser(email, username, password) {

        if (typeof email !== 'string') throw TypeError(`${email} is not a string`)
        if (email.match(/^(([^<>()\[\]\\.,;:\s@“]+(\.[^<>()\[\]\\.,;:\s@“]+)*)|(“.+“))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) === null) throw Error(`${email} is an invalid email`)
        if (typeof username !== 'string') throw TypeError(`${username} is not a string`)
        if (typeof password !== 'string') throw TypeError(`${password} is not a string`)


        if (!email.trim()) throw Error('email is empty or blank')
        if (!username.trim()) throw Error('username is empty or blank')
        if (!password.trim()) throw Error('password is empty or blank')

        
        return fetch(`${this.url}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({ email, username, password })
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
            })
    },

    /**
     * Login
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

    login(username, password) {


        if (typeof username !== 'string') throw TypeError(`${username} is not a string`)
        if (typeof password !== 'string') throw TypeError(`${password} is not a string`)

        if (!username.trim()) throw Error('username is empty or blank')
        if (!password.trim()) throw Error('password is empty or blank')

        return fetch(`${this.url}/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({ username, password })
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)

                const { id, token, username } = res.data

                this._userId = id
                this._token = token
                this._username = username

                sessionStorage.setItem('userId', id)
                sessionStorage.setItem('token', token)
            })
    },

    /**
     * 
     * Remove from session storage (user id and token)
     *
     */
    logout() {

        this.offlineUser()
                
        this._userId = null
        this._token = null

        sessionStorage.removeItem('userId')
        sessionStorage.removeItem('token')
               
    },

     /**
     * 
     * @returns {boolean} If the user is logged in or not
     *
     */
    get loggedIn() {

        return !!this._userId
    },




    /**
     * Upload Profile Picture
     * 
     * @param {string} file The picture
     *  
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    uploadImgProfile(picture) {

        let data = new FormData()
 
        data.append('picture', picture)
 
        return fetch (`${this.url}/users/${this._userId}/profilePicture`, {
            method:'POST',
            headers: {
                'Authorization': `Bearer ${this._token}`
            },
            body: data
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
                return res.data
            })
    },


    /**
     * Retrieve users of gallery 
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    retrieveGalleryUsers() {

        return fetch(`${this.url}/users/user/${this._userId}`, {headers: { 'Authorization': `Bearer ${this._token}` } })
            .then(res => res.json())
            .then(res => {
                
                if (res.error) throw Error(res.error)

                const users = res.data

                return users
            })
    },


     /**
     * Retrieve all users
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    retrieveUsers() {

        return fetch(`${this.url}/users`, {headers: { 'Authorization': `Bearer ${this._token}` } })
            .then(res => res.json())
            .then(res => {
                
                if (res.error) throw Error(res.error)
                const users = res.data

                return users
            })
    },



    /**
     * Retrieve current user
     * 
     * @param {string} userId  unique id of the user 
     * 
     * 
     * @throws {TypeError} in case user Id is not a string
     * 
     * 
     */
    getCurrentUser() {

        let id = this._userId

        if (typeof id !== 'string') throw new TypeError(`${id} is not a string`)

        if (!id.trim().length) throw Error('id is empty or blank')

        return fetch(`${this.url}/users/${this._userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                
                if (res.error) throw Error(res.error)
                return res.data
                
            })
    },


    /**
     * Retrieve user by id
     * 
     * @param {string} id The user id
     *  
     * @throws {TypeError} On non-string user id
     * @throws {Error} On empty or blank user id
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    retrieveUserById(id) {

        if (typeof id !== 'string') throw new TypeError(`${id} is not a string`)

        if (!id.trim().length) throw Error('id is empty or blank')

        return fetch(`${this.url}/users/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                
                if (res.error) throw Error(res.error)
                return res.data
                
            })
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
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */
    async modifyUser(username, password, newPassword, imgProfileUrl, bio) {
    
        if (typeof username !== 'string') throw TypeError(`${username} is not a string`)
        if (typeof password !== 'string') throw TypeError(`${password} is not a string`)
        if (bio != null && typeof bio !== 'string') throw TypeError(`${bio} is not a string`)
        if (!username.trim().length) throw Error('username is empty or blank')  
        if (!password.trim().length) throw Error('password is empty or blank')

        
        return fetch(`${this.url}/users/${this._userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this._token}`
            },
            body: JSON.stringify({username, password, newPassword, imgProfileUrl, bio })
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
            })
    },



    /**
     * Search Users
     * 
     * @param {string} query The query of a search box
     *  
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    searchUsers(query) {

        if (typeof query !== 'string') throw TypeError(`${query} is not a string`)
        if (typeof query === 'number') throw Error(`${query} is not a string`)
        if (typeof query === 'boolean') throw Error(`${query} is not a string`)
        if (typeof query === 'object') throw Error(`[object Object] is not a string`)


        return fetch(`${this.url}/users/search/${query}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
                
                const users = res.data

                return users
                                     
            })

    },



     /**
     * Add Follow
     * 
     * @param {string} followUsername The username of user that current user follows
     *  
     * @throws {TypeError} On non-string username of follow
     * @throws {Error} On empty or blank username of follow
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    addFollow(followUsername) {
       
        if (typeof followUsername !== 'string') throw TypeError(`${followUsername} is not a string`)

        if (!followUsername.trim()) throw Error('followUsername is empty or blank')

        return fetch(`${this.url}/users/${this._userId}/follows`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this._token}`
            },
            body: JSON.stringify({ followUsername })
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
            })
    },


    /**
     * Remove Follow
     * 
     * @param {string} followUsername The username of user that current user follows
     *  
     * @throws {TypeError} On non-string username of follow
     * @throws {Error} On empty or blank username of follow
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    removeFollow(followUsername) {
      
        if (typeof followUsername !== 'string') throw TypeError(`${followUsername} is not a string`)

        if (!followUsername.trim()) throw Error('followUsername is empty or blank')

        return fetch(`${this.url}/users/${this._userId}/follows`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this._token}`
            },
            body: JSON.stringify({ followUsername })
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
            })
    },



    /**
     * Is Follow?
     * 
     * @param {string} id The id of user
     *  
     * @throws {TypeError} On non-string id
     * @throws {Error} On empty or blank id
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    itsInFollows(id) {
       
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (typeof id === 'number') throw Error(`${id} is not a string`)
        if (id instanceof Array) throw Error(` is not a string`)
        if (typeof id === 'boolean') throw Error(`${id} is not a string`)
        if (typeof id === 'object') throw Error(`[object Object] is not a string`)

        if (!id.trim()) throw Error('id is empty or blank')

        return fetch(`${this.url}/users/${this._userId}/follows`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
                
                const follows = res.data

                if(follows.includes(id) )
                
                return true             
                           
            })

    },


    /**
     * Retrieve Follows
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    retrieveFollowsListUser() {

        return fetch(`${this.url}/users/${this._userId}/followsList`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
                
                const followsList = res.data
                
                return followsList
                                     
            })

    },


    /**
     * Retrieve Followees Vinyls
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    retrieveFolloweesListVinyls() {

        return fetch(`${this.url}/users/${this._userId}/followeesVinyls`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
                
                const followeesVinyls = res.data
                
                return followeesVinyls
                                     
            })

    },


    /**
     * Retrieve Followers
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    retrieveFollowersListUser() {

        return fetch(`${this.url}/users/${this._userId}/followersList`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
                
                const followersList = res.data
                
                return followersList
                                     
            })

    },



    /**
     * Search Vinyls
     * 
     * @param {string} query The query of a search box
     *  
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    searchListVinyls(query) {

        if (typeof query !== 'string') throw TypeError(`${query} is not a string`)
        if (typeof query === 'number') throw Error(`${query} is not a string`)
        if (typeof query === 'boolean') throw Error(`${query} is not a string`)
        if (typeof query === 'object') throw Error(`[object Object] is not a string`)

        return fetch(`${this.url}/vinyls/search/${query}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
                
                const vinyls = res.data

                return vinyls
                                     
            })

    },


    /**
     * Adds a vinyl
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

    addVinyl(title, artist, year, imgVinylUrl, info) {
       
        if (typeof title !== 'string') throw TypeError(`${title} is not a string`)
        if (!title.trim().length) throw TypeError('title is empty or blank')        

        if (typeof artist !== 'string') throw TypeError(`${artist} is not a string`)
        if (!artist.trim().length) throw TypeError('artist is empty or blank')

        if (typeof year !== 'string') throw TypeError(`${year} is not a number`)
        if ( year == 0) throw TypeError(`year is not a number`)

        if (info != null && typeof info !== 'string') throw TypeError(`${info} is not a string`)

        if (imgVinylUrl != null && typeof imgVinylUrl !== 'string') throw TypeError(`${imgVinylUrl} is not a string`)

        const id = this._userId

        return fetch(`${this.url}/vinyls`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this._token}`
            },
            body: JSON.stringify({ id, title, artist, year, imgVinylUrl, info })
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
                return res.data
                
            })
    },



     /**
     * Upload Vinyl Picture
     * 
     * @param {string} id The vinyl id
     * @param {string} file The picture
     *  
     * @throws {TypeError} On non-string vinyl id
     * @throws {Error} On empty or blank vinyl id
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */
    uploadImgVinyl(picture, id) {

        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (typeof id === 'number') throw TypeError(`${id} is not a string`)
        if (id instanceof Array) throw TypeError(` is not a string`)
        if (typeof id === 'boolean') throw TypeError(`${id} is not a string`)
        if (typeof id === 'object') throw TypeError(`[object Object] is not a string`)
        if (!id.trim().length) throw Error('id is empty or blank')

        let data = new FormData()
 
        data.append('picture', picture)
 
        return fetch (`${this.url}/vinyls/${id}/image`, {
            method:'POST',
            headers: {
                'Authorization': `Bearer ${this._token}`
            },
            body: data
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
                return res.data
            })
    },


    /**
     * Retrieve all vinyls
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    retrieveVinyls() {
   
        return fetch(`${this.url}/vinyls`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
                
                return  res.data
                                     
            })

    },


    /**
     * Retrieve Vinyl by id
     * 
     * @param {string} id The vinyl id
     *  
     * @throws {TypeError} On non-string vinyl id
     * @throws {Error} On empty or blank vinyl id
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    retrieveVinylById(id) {

        if (typeof id !== 'string') throw new TypeError(`${id} is not a string`)
        if (!id.trim().length) throw Error('id is empty or blank')

        return fetch(`${this.url}/vinyls/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                
                if (res.error) throw Error(res.error)
                return res.data
                
            })
    },


    /**
     * Retrieve Vinyl by user id
     * 
     * @param {string} id The user id
     *  
     * @throws {TypeError} On non-string user id
     * @throws {Error} On empty or blank user id
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */
    retrieveVinylsByUserId(id) {

        if (typeof id !== 'string') throw new TypeError(`${id} is not a string`)
        if (!id.trim().length) throw Error('id is empty or blank')
   
        return fetch(`${this.url}/vinyls/user/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
                
                return res.data
                                     
            })

    },

    /**
     * Retrieve Vinyl by current user id
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    retrieveVinylsCurrentUser() {
   
        return fetch(`${this.url}/vinyls/user/${this._userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
                
                return res.data
                                     
            })

    },


    /**
     * Delete Vinyl
     * 
     * @param {string} id The vinyl id
     *  
     * @throws {TypeError} On non-string id
     * @throws {Error} On empty or blank id
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    deleteVinyl(id) {

        if (typeof id !== 'string') throw new TypeError(`${id} is not a string`)
        if (!id.trim().length) throw Error('id is empty or blank')

        return fetch(`${this.url}/vinyls/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
            })
    },


    /**
     * Modify Vinyl
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
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    modifyVinyl(id, title, artist, year, imgVinylUrl, info) {

        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (!id.trim().length) throw TypeError('id is empty or blank') 
        
        if (typeof title !== 'string') throw TypeError(`${title} is not a string`)
        if (!title.trim().length) throw TypeError('title is empty or blank')        

        if (typeof artist !== 'string') throw TypeError(`${artist} is not a string`)
        if (!artist.trim().length) throw TypeError('artist is empty or blank')

        if (typeof year !== 'string') throw TypeError(`${year} is not a number`)
        if ( year == 0) throw TypeError(`year is not a number`)

        if (info != null && typeof info !== 'string') throw TypeError(`${info} is not a string`)

        if (imgVinylUrl != null && typeof imgVinylUrl !== 'string') throw TypeError(`${imgVinylUrl} is not a string`)

        return fetch(`${this.url}/vinyls/${id}/edit`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this._token}`
            },
            body: JSON.stringify({ id, title, artist, year, imgVinylUrl, info })
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
            })
    },


    /**
     * Add Like to Vinyl
     * 
     * @param {string} id The vinyl id
     *  
     * @throws {TypeError} On non-string id or user id
     * @throws {Error} On empty or blank id or user id
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    addLike(id) {
       
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (!id.trim()) throw Error('id is empty or blank')

        const userId = this._userId

        return fetch(`${this.url}/vinyls/${id}/likes`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this._token}`
            },
            body: JSON.stringify({ userId })
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
            })
    },


    /**
     * Remove Like to Vinyl
     * 
     * @param {string} id The vinyl id
     *  
     * @throws {TypeError} On non-string id or user id
     * @throws {Error} On empty or blank id or user id
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    removeLike(id) {
       
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (!id.trim()) throw Error('id is empty or blank')

        const userId = this._userId
      
        return fetch(`${this.url}/vinyls/${id}/likes`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this._token}`
            },
            body: JSON.stringify({ userId })
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
            })
    },


     /**
     * is Like?
     * 
     * @param {string} id The vinyl id
     *  
     * @throws {TypeError} On non-string id 
     * @throws {Error} On empty or blank id 
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    itsInLikes(id) {    
       
        if (typeof id !== 'string') throw Error(`${id} is not a string`)
        if (typeof id === 'number') throw Error(`${id} is not a string`)
        if (id instanceof Array) throw Error(` is not a string`)
        if (typeof id === 'boolean') throw Error(`${id} is not a string`)
        if (typeof id === 'object') throw Error(`[object Object] is not a string`)
        if (!id.trim()) throw Error('id is empty or blank')

        return fetch(`${this.url}/vinyls/${id}/likes`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error) 

                const userId = this._userId

                const likes = res.data

                if(likes.includes(userId))

                return true

            })
    },


    /**
     * Add comment to Vinyl
     * 
     * @param {string} id The vinyl id
     * @param {string} text The comment text
     *  
     * @throws {TypeError} On non-string id  or text
     * @throws {Error} On empty or blank id or text
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */
    addComment(id, text) {
       
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (!id.trim()) throw Error('id is empty or blank')

        if (typeof text !== 'string') throw TypeError(`${text} is not a string`)
        if (!text.trim()) throw Error('text is empty or blank')

        const userId = this._userId

        return fetch(`${this.url}/vinyls/${id}/comments`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this._token}`
            },
            body: JSON.stringify({ userId, text })
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
            })
    },

    /**
     * Retrieve commentS of Vinyl
     * 
     * @param {string} id The vinyl id
     *  
     * @throws {TypeError} On non-string id 
     * @throws {Error} On empty or blank id 
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    retrieveComments(id) {

        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (!id.trim()) throw Error('id is empty or blank')
   
        return fetch(`${this.url}/vinyls/${id}/comments`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
                
                return  res.data
                                     
            })

    },

     /**
     * Retrieve user favourites Vinyls
     * 
     * @param {string} id The vinyl id
     * @param {string} userId The user id
     *  
     * @throws {TypeError} On non-string id or userId
     * @throws {Error} On empty or blank id id or userId
     * @throws {NotFoundError} On vinyl id not found
     * 
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    retrieveFavouritesVinyls() {

        return fetch(`${this.url}/vinyls/user/${this._userId}/favourites`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
                
                const favouritesVinylsList = res.data
                
                return favouritesVinylsList
                                     
            })

    },



    onlineUser() {
        let connected = this._connected

        return fetch(`${this.url}/users/${this._userId}/connected`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this._token}`
            },
            body: JSON.stringify({ connected })
        })
            .then(res => res.json())
            .then(res => {
               
                if (res.error) throw Error(res.error)

            })
    },

     /**
     * Disonnected user
     * 
     *  
     * @returns {Promise} Resolves on correct data, rejects on wrong data
     */

    offlineUser() {
        const connected = 'offline'

        return fetch(`${this.url}/users/${this._userId}/disconnected`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this._token}`
            },
            body: JSON.stringify({ connected })
        })
            .then(res => res.json())
            .then(res => {
               
                if (res.error) throw Error(res.error)

            })
    },

 

   onBeforeUnload(){
        const connected = 'offline'

        return fetch(`${this.url}/users/${this._userId}/disconnected/close`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this._token}`
            },
            body: JSON.stringify({ connected })
        })
            .then(res => res.json())
            .then(res => {
               
                if (res.error) throw Error(res.error)

            })
      }
   
    
}

export default logic
// module.exports = logic