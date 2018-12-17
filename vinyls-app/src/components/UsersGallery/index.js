import React, { Component } from 'react'
import AliceCarousel from 'react-alice-carousel'
import { Link } from 'react-router-dom'
import logic from '../../logic'
import 'react-alice-carousel/lib/alice-carousel.css'
import './index.css'

class UsersGallery extends Component {  

  state= { users: [], error: null }

  responsive = {
    0: { items: 4},
    600: { items: 8 },
    1024: { items: 12 }
  }

  componentDidMount() {

    try {       
        
        logic.retrieveGalleryUsers()
        .then(res =>  this.setState({ users: res }))
        .catch(err => this.setState({ error: err.message }))
    } catch (err) {
        this.setState({ error: err.message })
    }
}

  
  galleryItems() {
    return (
      this.state.users.map((item, i) => (
        <div key={`key-${i}`} className='users-gallery'><Link to={`/profile/${item.idUser}`}> <img className='users-gallery__img' src={item.imgProfileUrl ? item.imgProfileUrl : './img/icon-profile.png'} alt='users'></img></Link> <h4 className='users-gallery__username'>{item.username}</h4></div>
      ))
    )
  };
  
  render() {
    const items = this.galleryItems();

    return (
      <AliceCarousel
        items={items}
        duration={400}
        startIndex = {1}
        buttonsDisabled={true}
        fadeOutAnimation={true}
        mouseDragEnabled={true}
        dotsDisabled={true}
        responsive={this.responsive}
        onSlideChange={this.onSlideChange}
        onSlideChanged={this.onSlideChanged}
      />
    )
  }
}

export default UsersGallery