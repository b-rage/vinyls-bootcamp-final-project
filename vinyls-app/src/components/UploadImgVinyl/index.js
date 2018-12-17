import React, {Component} from 'react'
import { Button } from 'mdbreact'
import { Link } from 'react-router-dom'
import logic from '../../logic'



class UploadImgVinyl extends Component {
    state={ picture: null, previewPicture: null, imgAdded: false}

  
    handleUploadImgVinyl = e => {
        e.preventDefault()
        
        try {
            logic.uploadImgVinyl(this.state.picture, this.props.id)
            .then(() => this.setState({previewPicture: null, picture: this.state.picture, imgAdded: true}))
            .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }

    }


    fileChangedHandler = event => {
    event.preventDefault()

    this.setState({previewPicture: URL.createObjectURL(event.target.files[0]), picture: event.target.files[0]})
    }


   render() {
       return(   <div>
        <form encType="multipart/form-data" onSubmit={this.handleUploadImgVinyl}>

        <div className="file-input-wrapper">
            <button className="btn-file-input">Select Image</button>
            <input type="file" type="file" className='inputfile' name="pic" accept="image/*" onChange={this.fileChangedHandler} />
        </div>
        <br></br>
        { this.state.previewPicture && <div className='img-load-container'>
            <img src={this.state.previewPicture} alt='' className='picture__preview'/>
        </div>}
        <br></br>
        { this.state.imgAdded && <p className='image-added'>Image Added Succefully</p>}
        <Button type='submit' color='black' className='upload-btn' >Upload Image</Button>
        </form>
        <Link to={`/vinyl/${this.props.id}/edit2`} ><span className='edit-next-btn'>Next</span></Link>
    </div>

       )
   }

}

export default UploadImgVinyl