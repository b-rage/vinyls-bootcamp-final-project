import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'mdbreact'
import  './index.css'

function Landing() {

    return <section className='container-landing'>
        
        <div className='container-landing-right'>

            <h1 className='landing-title'>Vinyls</h1>

            <Link to={'./register'} ><Button color='black darken-4'>Register</Button></Link>

            <Link to={'./login'}><Button color='black darken-4'>Login</Button> </Link>

        </div>
        
    </section>
}

export default Landing
