import React from 'react'
import '../auth.form.scss'
const Login = () => {

        const handle = (e)=>{
            e.preventDefault()
        }


  return (
    <main>
        <div className='form-container'>
            <h1>Login</h1>
            <form>

            <div className="input-group">
                <label htmlFor='email'>Email</label>
                <input type = "email" id="email" name='email' placeholder='Enter email'  />
            </div>
            <div className="input-group">
                <label htmlFor='email'>Password</label>
                <input type = "email" id="email" name='email' placeholder='Enter password'  />
            </div>

            <button className='button primary-button ' onClick={handle}>Login</button>



            </form>
        </div>
    </main>
  )
}

export default Login
