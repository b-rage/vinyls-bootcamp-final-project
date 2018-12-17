import React, { Component } from 'react'
import logic from '../../logic'
import Error from '../Error'
import VinylsSearchListItem from '../VinylsSearchListItem'
import { Input } from 'mdbreact'




class SearchListVinyls extends Component {

    state = {vinyls: [], error: null, search: ''}
    
    searchVinylsChange = event => {

        const query = event.target.value

        try {  
            
            logic.searchListVinyls(query)
            .then(res => { this.setState({ vinyls: res, error: null  }) })
            .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

       
    

    render() { 

        const { vinyls } = this.state

        return ( 

            <React.Fragment>
                <h2 className='text-center my-5'>Search Vinyls</h2> 

                <div className='search-user'>
                    <Input label='search' icon='search' type='text' onChange={this.searchVinylsChange} /> 
                </div>
                <div className='list-group-flush'>
                        {vinyls.map(vinyl => (
                            <VinylsSearchListItem key={vinyl.idVinyl} id={vinyl.idVinyl} title={vinyl.title} img={vinyl.imgVinylUrl}/>
                        ))}
                </div>
               
            </React.Fragment>
        )
    }
}

 
export default SearchListVinyls