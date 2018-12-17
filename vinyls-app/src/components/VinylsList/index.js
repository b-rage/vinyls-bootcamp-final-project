import React, { Component } from 'react'
import VinylListCardItem from '../VinylListCardItem'
import logic from '../../logic'
import './index.css'



class VinylsList extends Component {

    state = { vinyls: [], error: null}
    
    componentDidMount() {

        try {              
            logic.retrieveVinyls()
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
                
                <div className='list-card'>
                        {vinyls.map(vinyl => (
                            <VinylListCardItem key={vinyl.idVinyl} id={vinyl.idVinyl}  userId={vinyl.id} title={vinyl.title} artist={vinyl.artist} img={vinyl.imgVinylUrl} comments={vinyl.comments.length} likes={vinyl.likes.length} year={vinyl.year}/>
                        ))}
                </div>

            </React.Fragment>
         )
    }
}

 
export default VinylsList