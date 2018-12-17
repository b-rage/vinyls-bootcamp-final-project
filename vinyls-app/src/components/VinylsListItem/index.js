import React from 'react'
import { Link } from 'react-router-dom'
import './index.css'



const vinylsSearchListItem = (props) => {

    const { title, artist, img, id } = props

  return (
    <div>
        <div className='vinyl-item-p'>
            <Link to={`/vinyl/${id}`}><li className='list-group-item'> <span><img className='vinyl-img-small-p' src={img ? img : './img/vinyl.png'}></img></span> <span className='title' >{title}</span><span className='artist'>{artist}</span></li></Link>
        </div>
    </div>
  )
}


export default vinylsSearchListItem