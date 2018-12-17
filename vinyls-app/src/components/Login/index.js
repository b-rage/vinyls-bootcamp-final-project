import React, {Component} from 'react'
import { Button, Input } from 'mdbreact'
import  './index.css'

class Login extends Component {
    state = { username: '', password: '' }

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

        const { username, password } = this.state

        this.props.onLogin(username, password)
    }

    render() {

        return <div className="login-container">

        <form onSubmit={this.handleSubmit}>

            <Input label="Username" type="text" onChange={this.handleUsernameChange} />

            <Input label="Password" type="password" onChange={this.handlePasswordChange} />
            
            <div className="button-container">
           
            <Button color="black" type="submit">Login</Button> 
            <br></br><br></br>
            <a className='back' href="#" onClick={this.props.onGoBack}>Back</a>
            </div>
            
        </form>
        
        </div>
    }
}

export default Login
