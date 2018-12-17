import React, { Component } from 'react'
import VinylsListItem from '../VinylsListItem'
import logic from '../../logic'
import './index.css'



class VinylsListProfilePublic extends Component {

    state = { vinyls: [], error: null}
    
    componentDidMount() {

        try {              
            logic.retrieveVinylsByUserId(this.props.id)
            .then(vinyls => { this.setState({ vinyls }) })
            .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }
    render() { 

        const { vinyls } = this.state
        
        return ( 
            <React.Fragment>
                <div className='vinyls-list'>
                    <ul className='list-group-flush'>
                    {vinyls.map(vinyl => (
                        <VinylsListItem key={vinyl.idVinyl} id={vinyl.idVinyl} userId={vinyl.id} title={vinyl.title} artist={vinyl.artist} img={vinyl.imgVinylUrl}/>
                    ))}
                    </ul>
                </div> 
            </React.Fragment>
         )
    }
}

 
export default VinylsListProfilePublic