import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import AddComment from  '../AddComment'
import CommentsList from  '../CommentsList'
import Error from '../Error'
import { Link } from 'react-router-dom'
import logic from '../../logic'
import './index.css'



class Vinyl extends Component {
    state = { id: '', title: '', artist: '', year: '', info:'', imgVinylUrl: null, comments:[], likes:[], likeSelected: false, text:'', error: null, addComment: false, user:{} }  


    componentDidMount() {
       
        try {
            logic.retrieveVinylById(this.props.id)
            .then(vinyl => this.setState({ id: vinyl.id, title: vinyl.title, artist: vinyl.artist, year: vinyl.year, info: vinyl.info, imgVinylUrl: vinyl.imgVinylUrl, comments: vinyl.comments, likes: vinyl.likes  }))
            .then(() => {
                logic.retrieveUserById(this.state.id)       
                .then(user => this.setState ({ user }))
                .catch(err => this.setState({ error: err.message }))
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
                    .then(vinyl => this.setState({ id: vinyl.id, title: vinyl.title, artist: vinyl.artist, year: vinyl.year, info: vinyl.info, imgVinylUrl: vinyl.imgVinylUrl, comments: vinyl.comments, likes: vinyl.likes, likeSelected: true }))
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
                    .then(vinyl => { this.setState({  id: vinyl.id, title: vinyl.title, artist: vinyl.artist, year: vinyl.year, info: vinyl.info, imgVinylUrl: vinyl.imgVinylUrl, comments: vinyl.comments, likes: vinyl.likes, likeSelected: false }) })
                })
                .catch(err => this.setState({ error: err.message }))
            } catch (err) {
                this.setState({ error: err.message })
            }
    }

    handleAddComment = (text) => {
        
        try {       
            
            logic.addComment(this.props.id, text)
            .then(() => {
                logic.retrieveComments(this.props.id)
                    .then(comments => { this.setState({ comments, addComment: false }) })
                    .catch(err => this.setState({ error: err.message }))
            })
            .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }


    handleaddCmtBtn = () => {
  
        if(this.state.addComment == false) {
            
            this.setState({ addComment: true })
        }else{
            this.setState({ addComment: false })
        }

        
    }

    handleSubmit = () => {
        
        const { text } = this.state

        this.handleAddComment( text )

    }



    render() {

        const {error, imgVinylUrl, artist, title, year, info, likeSelected, likes, comments, addComment, id, user } = this.state

        const connection = user.connection
        
        return  <div className='vinyl-container'>
                    <img className='vinyl-img'  src={imgVinylUrl ? imgVinylUrl : './img/vinyl.png'} ></img>
                    {error && <Error message={error} />}
                    <p className='vinyl-title'>{title}</p>
                    <p className='vinyl-artist'>{artist}</p>
                    <p className='vinyl-year'>{year}</p>
                    <a href="#" onClick={likeSelected ? this.handleDontLikeClick : this.handleLikeClick}> {likeSelected ? <span className='dont-like-btn'><i className='fa fa-star'><span className='likes-count'>{likes.length}</span></i></span> : <span className='like-btn'><i className='far fa-star'><span className='likes-count'>{likes.length}</span></i></span>}</a>
                    <br></br>
                    <div className='profile-vinyl'>
                        <Link to={`/profile/${id}`}><img className='profile-img-list' src={user.imgProfileUrl ? user.imgProfileUrl : './img/icon-profile.png'} ></img>{connection === 'online' ? <span className='dot'></span> : <span className='dot-offline'></span>} <span className='profile-username-list'>{user.username}</span></Link>
                    </div>
                    <p className='vinyl-info'>{info}</p>
                    <div className='msg-button'>
                        <span><i className="far fa-comment-alt"></i></span>
                        <a onClick={this.handleaddCmtBtn}><p className='add-comment-icon-text'>Add Comment</p></a>
                    </div>
                    {addComment ? <AddComment onAddComment={this.handleAddComment} /> : null }
                    <CommentsList comments={comments} />   
                </div>
    }
}

export default withRouter(Vinyl)