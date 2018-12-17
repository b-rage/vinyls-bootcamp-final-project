import React, { Component } from 'react'
import CommentsList from '../CommentsList'
import AddComment from  '../AddComment'
import logic from '../../logic'
import './index.css'

class CommentersList extends Component {

    state = { comments: [], error: null, addComment: false }

    componentDidMount() {

        try {              
            logic.retrieveComments(this.props.id)
            .then(comments => { this.setState({ comments }) })
            .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleAddComment = (text) => {
        
        try {       
            
            logic.addComment(this.props.id, text)
            .then(() => {
                logic.retrieveComments(this.props.id)
                    .then(comments => { this.setState({ comments, addComment: false }) })
                    .catch(err => this.setState({ error: err.message }))
            })
            .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }


    handleaddCmtBtn = () => {
  
        if(this.state.addComment == false) {
            
            this.setState({ addComment: true })
        }else{
            this.setState({ addComment: false })
        }

        
    }

    handleSubmit = () => {
        
        const { text } = this.state

        this.handleAddComment( text )

    }
     

  render() {

    const { comments, addComment } = this.state


    return (
            <div className='commenters-list'>
            
                    <div className='msg-btn'>
                        
                        <a onClick={this.handleaddCmtBtn}><p className='add-comment-btn'>Add Comment</p></a>
                    </div>
                    {addComment ? <AddComment onAddComment={this.handleAddComment} /> : null }
                    <CommentsList comments={comments} /> 
            </div>
    )
  }
}

export default  CommentersList