import React, { Component } from 'react'
import VinylsListProfileItem from '../VinylsListProfileItem'
import logic from '../../logic'




class VinylsListProfile extends Component {

    state = { vinyls: [], error: null}
    
    componentDidMount() {

        try {              
            logic.retrieveVinylsCurrentUser()
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
                        <VinylsListProfileItem key={vinyl.idVinyl} id={vinyl.idVinyl} userId={vinyl.id} title={vinyl.title} artist={vinyl.artist} img={vinyl.imgVinylUrl}/>
                    ))}
                    </ul>
                </div> 
            </React.Fragment>
         )
    }
}

 
export default VinylsListProfile