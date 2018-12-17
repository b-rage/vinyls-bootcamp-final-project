import React from 'react'
import UploadImgVinyl from '../UploadImgVinyl'



const EditVinyl1 = (props) => {
  return (
        <div className='edit-profile1-container'>
               
                <h3>Change Vinyl Image</h3>
                <UploadImgVinyl id={props.id}/>
  
        </div>
  )
}

export default EditVinyl1
