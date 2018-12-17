import React, { Component } from 'react'
import FollowersListUserItem from '../FollowersListUserItem'
import logic from '../../logic'



class FollowersListUser extends Component {

    state = { username: '', imgProfileUrl: null, bio: '', error: null, followersListUser: [] }
    
    componentDidMount() {
        try {       
            logic.retrieveFollowersListUser()        
            .then(res => {
                this.setState ({ username: res.username, imgProfileUrl: res.imgProfileUrl, followersListUser: res })
            })
            .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }
    render() { 

        const { followersListUser } = this.state
        
        return ( 
            <React.Fragment>
                <div className='vinyls-list'>
                        <ul className='list-group-flush'>
                        {followersListUser.map(follower => (
                            <FollowersListUserItem key={follower.username} connection={follower.connection} id={follower.idUser} username={follower.username} imgProfileUrl={follower.imgProfileUrl} />
                        ))}
                        </ul>
                </div>

            </React.Fragment>
         )
    }
}

 
export default FollowersListUser