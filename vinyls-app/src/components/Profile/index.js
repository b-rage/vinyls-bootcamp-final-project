import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { Button } from 'mdbreact'
import { Link } from 'react-router-dom'
import logic from '../../logic'
import VinylsListProfile from '../VinylsListProfile'
import Error from '../Error'
import './index.css'

class Profile extends Component {

    state = { username: '', imgProfileUrl: null, bio: '', follows: [], followers: [], error: null }

    componentDidMount() {
        try {       
            
            logic.getCurrentUser()
            .then(user => { this.setState({ username: user.username, imgProfileUrl: user.imgProfileUrl, bio: user.bio, follows: user.follows, followers: user.followers, error: null  }) })
            .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }



    handleEditClick = () => this.props.history.push('/edit-profile') 


    render() {

        const { imgProfileUrl, username, bio, follows, followers, error } = this.state

        return  <div className='profile-container'>

                    <img className='profile-img' src={imgProfileUrl ? imgProfileUrl : './img/icon-profile.png'} ></img>
                    <p className='profile-username'> {username}</p>
                    <Link to={`/follows`}> <p className='follow-btn-profile'>Follow {follows.length}</p></Link> 
                    <Link to={`/followers`}><p className='followers-btn-profile'>Followers {followers.length}</p></Link>
                    {error && <Error message={error} />}
                    <p className='profile-bio'>{bio}</p>
                    <section className='btn-edit-section'><Button color='black' onClick={this.handleEditClick}>Edit Profile</Button></section>
                    <VinylsListProfile id={this.props.id}/>
            
            
                </div>

            
            
        
    }
}

export default withRouter(Profile)