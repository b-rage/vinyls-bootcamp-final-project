import React from 'react'
import { Link } from 'react-router-dom'
import './index.css'



const FollowersListUserItem = (props) => {

    const { imgProfileUrl, username, id, connection } = props

    
    return (
        <li className='list-group-item'><Link to={`/profile/${id}`}><img className='profile-img-list' src={imgProfileUrl ? imgProfileUrl : './img/icon-profile.png'} ></img>{connection === 'online' ? <span className='dot'></span> : <span className='dot-offline'></span>} <span className='profile-username-list'>{username}</span></Link></li>
    )
}


export default FollowersListUserItem