import React, { Component } from 'react'
import { Route, withRouter, Redirect } from 'react-router-dom'
import logic from './logic'
import Index from './components/Index'
import Login from './components/Login'
import Register from './components/Register'
import NavbarComponent from './components/NavbarComponent'
import Landing from './components/Landing'
import Error from './components/Error'
import Profile from './components/Profile'
import EditProfile1 from './components/EditProfile1'
import EditProfile2 from './components/EditProfile2'
import PublicProfile from './components/PublicProfile'
import FollowsListUser  from './components/FollowsListUser'
import FollowersListUser  from './components/FollowersListUser'
import SearchListUsers from './components/SearchListUsers'
import AddVinyl from './components/AddVinyl'
import AddVinyl2 from './components/AddVinyl2'
import Vinyl from './components/Vinyl'
import EditVinyl1 from './components/EditVinyl1'
import EditVinyl2 from './components/EditVinyl2'
import SearchListVinyls from './components/SearchListVinyls'
import FolloweesVinyls from './components/FolloweesVinyls'
import FavouritesVinyls from './components/FavouritesVinyls'
import CommentersList from './components/CommentersList'


logic.url = process.env.REACT_APP_API_URL
// logic.url = 'http://localhost:5000/api'

class App extends Component {

    state = { error: null }

    componentDidMount() {
        window.addEventListener('beforeunload', this.handleLeavePage);
      }
    
      componentWillUnmount() {
        window.removeEventListener('beforeunload', this.handleLeavePage);
      }
    


    
    handleLeavePage = (e) => {
        e.preventDefault()
        try {
            logic.onBeforeUnload()
                .then(() => {
                    
                    this.setState({ error: null })
                })
                .catch(err => this.setState({ error: err.message }))
            
        } catch (err) {
            this.setState({ error: err.message })
        }

        const confirmationMessage = ''
        e.returnValue = confirmationMessage     // Gecko, Trident, Chrome 34+
        return confirmationMessage
    }
   
    handleRegister = ( email, username, password, bio ) => {
  
        try {
            logic.registerUser(email, username, password, bio)
                .then(() => {
                    this.setState({ error: null }, () => this.props.history.push('/login'))
                })
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }
    
    handleLogin = (username, password) => {
        
        try {
            logic.login(username, password)
                .then(() =>  this.setState({ error: null }))
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    
    }
    
    
    handleLogoutClick = () => {
        this.setState({error: null})
        logic.logout()
        this.props.history.push('/')
    }

    handleGoBack = () =>  {
        this.setState({error: null})
        this.props.history.push('/')
    }
    
    

    render() { 

        const { error } = this.state

        return  <div className='app-container'>
                {/* <Beforeunload onBeforeunload={this.handleLeavePage} /> */}
                  {logic.loggedIn && <NavbarComponent onLogout={this.handleLogoutClick}></NavbarComponent>}
                  <Route exact path="/" render={() => !logic.loggedIn ? <Landing onRegisterClick={this.handleRegisterClick} onLoginClick={this.handleLoginClick}/> : <Redirect to="/index" />} /> 
                  <Route path="/register" render={() => !logic.loggedIn ? <Register onRegister={this.handleRegister} onGoBack={this.handleGoBack}  /> : <Redirect to="/index" />} /> 
                  <Route path="/login" render={() => !logic.loggedIn ? <Login onLogin={this.handleLogin} onGoBack={this.handleGoBack}  /> : <Redirect to="/index" />} /> 
                  {error && <Error message={error} />}
                  <Route path="/index" render={() => logic.loggedIn ? <Index onLogin={this.handleLogin}  /> : <Redirect to="/index" />}/> 
                  <Route path="/edit-profile" render={() => logic.loggedIn ? <EditProfile1 /> : <Redirect to="/login" />} />
                  <Route path="/edit-profile2" render={() => logic.loggedIn ? <EditProfile2 /> : <Redirect to="/login" />} />
                  <Route exact path="/profile" render={() => logic.loggedIn ? <Profile /> : <Redirect to="/login" />} />
                  <Route exact path="/profile/:id" render={(props) => logic.loggedIn ? <PublicProfile id={props.match.params.id}/> : <Redirect to="/login" />} />
                  <Route exact path="/follows" render={() => logic.loggedIn ? <FollowsListUser /> : <Redirect to="/login" />} />
                  <Route exact path="/followers" render={() => logic.loggedIn ? <FollowersListUser /> : <Redirect to="/login" />} />
                  <Route exact path="/users" render={() => logic.loggedIn ? <SearchListUsers /> : <Redirect to="/login" />} />
                  <Route path="/vinyls" render={() => logic.loggedIn ? <SearchListVinyls /> : <Redirect to="/login" />} />
                  <Route path="/add-vinyl" render={() => logic.loggedIn ? <AddVinyl /> : <Redirect to="/login" />} />
                  <Route exact path="/vinyl/:id/add-vinyl2" render={(props) => logic.loggedIn ? <AddVinyl2 id={props.match.params.id} /> : <Redirect to="/login" />} />
                  <Route exact path="/vinyl/:id" render={(props) => logic.loggedIn ? <Vinyl id={props.match.params.id}/> : <Redirect to="/login" />} />
                  <Route exact path="/vinyl/:id/edit1" render={(props) => logic.loggedIn ? <EditVinyl1 id={props.match.params.id}/> : <Redirect to="/login" />} />
                  <Route exact path="/vinyl/:id/edit2" render={(props) => logic.loggedIn ? <EditVinyl2 id={props.match.params.id}/> : <Redirect to="/login" />} />
                  <Route exact path="/vinyl/:id/commenters-list" render={(props) => logic.loggedIn ? <CommentersList id={props.match.params.id}/> : <Redirect to="/login" />} />
                  <Route path="/followees-vinyl" render={() => logic.loggedIn ? <FolloweesVinyls /> : <Redirect to="/login" />} />
                  <Route path="/favourites-vinyl" render={() => logic.loggedIn ? <FavouritesVinyls /> : <Redirect to="/login" />} />
                </div> 

           
    }
}

export default withRouter (App);

