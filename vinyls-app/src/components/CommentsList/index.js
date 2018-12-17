import React from 'react'
import Comment from '../Comment'
import './index.css'




const CommentsList = (props) => {

        const { comments } = props

        const commentsRev = comments.reverse()

  return (
            <React.Fragment>
                <div className='comments-list'>
                        <ul className='list-group-flush'>
                        {commentsRev.map(comment => (
                            <Comment key={comment.idComment}  id={comment.user} username={comment.username} text={comment.text}  imgProfile={comment.imgProfileUrl}/>
                        ))}
                        </ul>
                </div> 
            </React.Fragment>
  )
}


export default CommentsList
