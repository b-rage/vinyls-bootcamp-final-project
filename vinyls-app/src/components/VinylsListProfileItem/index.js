import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Error from '../Error'
import logic from '../../logic'
import './index.css'

class VinylsListProfileItem extends Component {

    state = { deleted: false, error: null}

    handleRemoveVinyl = () => {
       
        try {       
            
            logic.deleteVinyl(this.props.id)
            .then(() => this.setState({ deleted: true, error: null }))
            .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }
    
    render() { 
        const { title, img, id } = this.props

        const { deleted, error } = this.state

        return ( <div>
                    {error && <Error message={error} />}
                    { !deleted ? <div className='vinyl-item'>
                        <div>
                        <Link to={`/vinyl/${id}`}>
                            <li className='list-group-item profile'>
                                <span><img className='vinyl-img-small' src={img ? img : './img/vinyl.png'} alt={title}></img></span> 
                                <span className='title-list' >{title}</span>
                            </li>
                        </Link>
                        </div>
                        <div>
                            <Link to={`/vinyl/${id}/edit1`}><span className='edit-btn' >edit</span></Link>
                            <a onClick={this.handleRemoveVinyl}><span className='delete-btn' >delete</span></a>
                        </div>
                        
                    </div> : null}
                </div>
            
         )
    }
}
 
export default VinylsListProfileItem