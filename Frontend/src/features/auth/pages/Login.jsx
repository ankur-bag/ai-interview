import React, { useState } from 'react'
import '../auth.form.scss'
import { Navigate,Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
const Login = () => {
    const {loading,handleLogin} = useAuth()

    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")

    const handleSubmit = (e)=>{
        e.preventDefault()
        handleLogin({email,password})
    }

        const handle = (e)=>{
            e.preventDefault()
        }


        if(loading){
            return (
                <main><h1>Loading....</h1></main>
            )
        }

  return (
    <main>
        <div className='form-container'>
            <h1>Login</h1>
            <form  onSubmit={handleSubmit}    >

            <div className="input-group">
                <label htmlFor='email'>Email</label>
                <input
                onChange={(e)=>{setEmail(e.target.value)}}
                type = "email" id="email" name='email' placeholder='Enter email'  />
            </div>
            <div className="input-group">
                <label htmlFor='email'>Password</label>
                <input 
                onChange={(e)=>{setPassword(e.target.value)}}
                type = "email" id="email" name='email' placeholder='Enter password'  />
            </div>

            <button className='button primary-button ' onClick={handle}>Login</button>



            </form>
                        <p>Don't have an account? Please <Link to={"/register"}>Register</Link></p>

        </div>
    </main>
  )
}

export default Login
