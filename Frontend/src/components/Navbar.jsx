import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../features/auth/hooks/useAuth'
import './navbar.scss'

const Navbar = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, setUser } = useAuth()

    const isActive = (path) => location.pathname === path

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:3000/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            })
            setUser(null)
            navigate('/login')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    return (
        <nav className='glass-card navbar'>
            <div className='navbar-container'>
                <Link to='/' className='navbar-brand'>
                    <span className='brand-icon'>⚡</span>
                    <h2 className='home-title'>Interview<span className='highlight'>AI</span></h2>
                </Link>

                <div className='navbar-links'>
                    <Link
                        to='/interview-prep'
                        className={`nav-link ${isActive('/interview-prep') ? 'active' : ''}`}
                    >
                        Preparation
                    </Link>
                    <Link
                        to='/interview-resume'
                        className={`nav-link ${isActive('/interview-resume') ? 'active' : ''}`}
                    >
                        Resume Builder
                    </Link>
                </div>

                <div className='navbar-user'>
                    <div className='user-info'>
                        <div className='user-avatar'>{user?.name?.[0] || 'U'}</div>
                        <span className='user-name'>{user?.name || 'User'}</span>
                    </div>
                    <button className='button secondary-button small logout-btn' onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar