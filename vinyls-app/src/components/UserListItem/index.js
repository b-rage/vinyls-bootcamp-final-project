import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Error from '../Error'
import logic from '../../logic'
import './index.css'



class UserListItem extends Component {

    state = { error: null }


  render() {

    const { imgProfileUrl, username, id, connection } = this.props

    const { error } = this.state



    return (
        <div>
            {error && <Error message={error} />}
        <li className='list-group-item'><Link to={`/profile/${id}`}><img className='profile-img-list' src={imgProfileUrl ? imgProfileUrl : './img/icon-profile.png'} ></img>{connection === 'online' ? <span className='dot'></span> : <span className='dot-offline'></span>} <span className='profile-username-list'>{username}</span></Link></li>
        </div>
    )
  }
}

export default UserListItem
