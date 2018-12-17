import React from 'react'
import { Link } from 'react-router-dom'
import './index.css'



const Comment = (props) => {

  const {username, imgProfile, text, id} = props

  return (
            <div className='comment-first-container'>
                <div>
                  <Link to={`/profile/${id}`}>
                  <img className='img-profile-micro' src={imgProfile ? imgProfile : './img/icon-profile.png'}/>
                  </Link>
                </div>
                <div className='comment-user-container'>                
                    <p className='comment-username'>{username}</p>
                    <p className='comment-text'>{text}</p>
                </div>

            </div>
  )
}

export default Comment
