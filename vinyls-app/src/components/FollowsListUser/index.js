import React, { Component } from 'react'
import FollowsListUserItem from '../FollowsListUserItem'
import logic from '../../logic'




class FollowsListUser extends Component {

    state = { error: null, followsListUser: [] }
    
    componentDidMount() {
        try {       
            logic.retrieveFollowsListUser()        
            .then(res => {
                this.setState ({  followsListUser: res })
            })
            .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }
    render() { 

        const { followsListUser } = this.state
        
        return ( 
            <React.Fragment>
                <div className='vinyls-list'>
                        <ul className='list-group-flush'>
                        {followsListUser.map(follow => (
                            <FollowsListUserItem key={follow.username} connection={follow.connection}  id={follow.idUser} username={follow.username} imgProfileUrl={follow.imgProfileUrl} />
                        ))}
                        </ul>
                </div>

            </React.Fragment>
         )
    }
}

 
export default FollowsListUser