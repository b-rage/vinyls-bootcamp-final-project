import React, { Component } from 'react'
import logic from '../../logic'
import UserListItem from '../UserListItem'
import { Input } from 'mdbreact'
import './index.css'



class SearchListUsers extends Component {

    state = {users: [], error: null, search: ''}
    

    searchUserChange = event => {

        const query = event.target.value

        try {  
            
            logic.searchUsers(query)
            .then(res => { this.setState({ users: res, error: null  }) })
            .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

       
    

    render() { 

        const { users } = this.state

        return ( 

            <React.Fragment>
                <h2 className='text-center my-5'>Search Users</h2> 

                <div className='search-user'>
                    <Input label='search' icon='search' type='text' onChange={this.searchUserChange} /> 
                </div>
                
                <div className='list-group-flush'>
                        {users.map(user => (
                            <UserListItem key={user.idUser} connection={user.connection}  id={user.idUser} username={user.username} imgProfileUrl={user.imgProfileUrl}/>
                        ))}
                </div>
               
            </React.Fragment>
        )
    }
}

 
export default SearchListUsers