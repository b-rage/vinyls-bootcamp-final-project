import React, { Component } from 'react'
import VinylListCardItem from '../VinylListCardItem'
import logic from '../../logic'




class FavouritesVinyls extends Component {

    state = { FavouritesVinyls: [], error: null}
    
    componentDidMount() {

        try {              
            logic.retrieveFavouritesVinyls()
            .then(FavouritesVinyls => { this.setState({ FavouritesVinyls }) })
            .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }
    render() { 

        const { FavouritesVinyls } = this.state

        const _FavouritesVinyls = FavouritesVinyls.reverse()
        
        return ( 
            <React.Fragment>

                <h2 className='text-center my-5'>My Favourites Vinyls</h2> 
                
                <div className='list-card'>
                        {_FavouritesVinyls.map(vinyl => (
                            <VinylListCardItem key={vinyl.idVinyl} id={vinyl.idVinyl} userId={vinyl.id} title={vinyl.title} artist={vinyl.artist} img={vinyl.imgVinylUrl} comments={vinyl.comments.length} likes={vinyl.likes.length} year={vinyl.year}/>
                        ))}
                </div>

            </React.Fragment>
         )
    }
}

 
export default FavouritesVinyls