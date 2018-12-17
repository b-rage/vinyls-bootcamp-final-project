import React, {Component} from 'react'
import { Button, Input } from 'mdbreact'
import  './index.css'

class Register extends Component {
    state = { email: '', username: '', password: '' }

    handleEmailChange = e => {
        const email = e.target.value

        this.setState({ email })
    }

    handleUsernameChange = e => {
        const username = e.target.value

        this.setState({ username })
    }

    handlePasswordChange = e => {
        const password = e.target.value

        this.setState({ password })
    }


    handleSubmit = e => {
        e.preventDefault()

        const {  email, username, password } = this.state

        this.props.onRegister( email, username, password )
    }

    render() {
        return <div className="register-container">

        <form onSubmit={this.handleSubmit}>


            <Input type="text" label="Email" onChange={this.handleEmailChange} />

            <Input type="text" label="Username" onChange={this.handleUsernameChange} />

            <Input type="password" label="Password" onChange={this.handlePasswordChange} />

            <div className="button-container">
         
            <Button color="black" type="submit">Register</Button> 
            <br></br><br></br>
            <a className='back' href="#" onClick={this.props.onGoBack}>Back</a>
            </div>
        </form>
        </div>
    }
}

export default Register
