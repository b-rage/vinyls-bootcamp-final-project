import React from 'react'
import { Link } from 'react-router-dom'



const VinylsSearchListItem = (props) => {

    const { title, img, id } = props

    return (
        <li className='list-group-item'><Link to={`/vinyl/${id}`}><img className='profile-img-list' src={img ? img : './img/vinyl.png'} ></img> <span className='profile-username-list'>{title}</span></Link></li>
    )
}


export default VinylsSearchListItem
