import React, { Component } from 'react'
import VinylsList from '../VinylsList'
import UsersGallery from '../UsersGallery'
import { Link } from 'react-router-dom'
import { Button } from 'mdbreact'
import logic from '../../logic'
import './index.css'


class Index extends Component {

    state = { error: null }

    componentDidMount() {
        
        try {
            logic.onlineUser()
                .then(() => this.setState({ error:null }))
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }


    render() { 
        return (  <div>

                    <UsersGallery></UsersGallery>
                    <div className='container-btn'>
                        <Link to='/add-vinyl'> <section><Button color='black'>ADD VINYL</Button></section></Link>
                    </div>
                    <VinylsList></VinylsList>
                  </div>
           
         )
    }
}


 
export default Index
