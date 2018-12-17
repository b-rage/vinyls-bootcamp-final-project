import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import logic from '../../logic'
import './index.css'

class VinylListCardItem extends Component {

      state = { user: {}, likes:[], likeSelected: false, error: null, }

      componentDidMount() {

          try {              
              
              logic.retrieveUserById(this.props.userId)       
              .then(user => this.setState ({ user }))
              .catch(err => this.setState({ error: err.message }))
              .then(() => {
                logic.retrieveVinylById(this.props.id)
                .then(vinyl => { this.setState({ likes: vinyl.likes }) })
              })
              .catch(err => this.setState({ error: err.message }))
              logic.itsInLikes(this.props.id)        
              .then(res => this.setState ({ likeSelected: res }))
              .catch(err => this.setState({ error: err.message }))

          } catch (err) {
              this.setState({ error: err.message })
          }
      }

      handleLikeClick = e => { 
        e.preventDefault()
             try {       
            
                logic.addLike(this.props.id)
                .then(() => {
                    logic.retrieveVinylById(this.props.id)
                    .then(vinyl => this.setState({ likes: vinyl.likes, likeSelected: true }))
                })
                .catch(err => this.setState({ error: err.message }))
            } catch (err) {
                this.setState({ error: err.message })
            }
    }


    handleDontLikeClick = e => {
        e.preventDefault()

             try {       
            
                logic.removeLike(this.props.id)
                .then(() => {
                    logic.retrieveVinylById(this.props.id)
                    .then(vinyl => { this.setState({ likes: vinyl.likes, likeSelected: false }) })
                })
                .catch(err => this.setState({ error: err.message }))
            } catch (err) {
                this.setState({ error: err.message })
            }
    }
        
      render() { 
            const { title, artist, img, year, id, comments, userId } = this.props
            const { user, likeSelected, likes } = this.state
            const connection = user.connection
            return ( 
                
                  <div className='card'>
                  <div className='card-user'>
                    <Link to={`/profile/${userId}`}><img className='profile-img-card' src={user.imgProfileUrl ? user.imgProfileUrl : './img/icon-profile.png'} ></img>{connection === 'online' ? <span className='dot'></span> : <span className='dot-offline'></span>} <span className='profile-username-card'>{user.username}</span></Link>
                  </div>
                    <div className='card-image'>
                      <img src={img ? img : './img/vinyl.png'} alt='vinyls'/>
                      <Link to={`/vinyl/${id}`}  className="float">      
                        <i className="fa fa-plus my-float"></i>        
                      </Link>
                    </div>
                    <p className='artist-card'>{artist}</p>
                    <span className='title-card'>{title}</span>
                    <span className='year-card'>{year}</span>
                    
                    <div className='card-content'>
                    <Link to={`/vinyl/${id}/commenters-list`}> <i className="far fa-comment-alt"></i> <span className='comment-card' >{comments}</span></Link>
                      {/* <i className="fas fa-star"></i><span className='likes-card'>{likes}</span> */}
                      <a href="#" onClick={likeSelected ? this.handleDontLikeClick : this.handleLikeClick}> {likeSelected ? <span className='likes-card'><i className='fa fa-star'><span className='likes-count-card'>{likes.length}</span></i></span> : <span className='likes-card'><i className='far fa-star'><span className='likes-count-card'>{likes.length}</span></i></span>}</a>
                      
                    </div>
                  </div>

            )
      }
}
 
export default VinylListCardItem