import React, { Component } from 'react'
import './index.css'



class AddComment extends Component {

    state = { text:'' }


    handleTextChange = e => {
        const text = e.target.value

        this.setState({ text })
    }

    handleSubmit = e => {

        e.preventDefault()
        
        const { text } = this.state

        this.props.onAddComment( text ) 
        
        this.setState({ text: '' })
    }

    render() {

        return <div className='add-comment-container'>

                <form className='form-add-comment' onSubmit={this.handleSubmit}>
                    <textarea className='textarea' type='text'  id='comment-text' value={this.state.text} onChange={this.handleTextChange} />
                    <button type='submit'id='comment-btn' >send</button>
                </form>
        </div>
    }
}

export default AddComment

