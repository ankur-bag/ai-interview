import React from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { 
    Sparkles, 
    Zap, 
    Target, 
    ShieldCheck, 
    ChevronRight,
    ArrowUpRight,
    Link2
} from 'lucide-react'
import { useAuth } from '../features/auth/hooks/useAuth'
import '../style/landing.scss'

const Landing = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        }
    }

    return (
        <main className='landing-v3'>
            <div className='mesh-bg-v3'></div>
            
            <div className='landing-wrapper'>
                <motion.section 
                    className='hero-centered'
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <motion.div className='pre-title' variants={itemVariants}>
                        <Sparkles size={16} className='icon-orange' />
                        <span>The future of career growth</span>
                    </motion.div>

                    <motion.h1 className='hero-title-v3' variants={itemVariants}>
                        Master your interviews <br />
                        with <span className='highlight-orange'>AI Intelligence</span>
                    </motion.h1>

                    <motion.p className='hero-subtitle-v3' variants={itemVariants}>
                        The ultimate toolkit for modern job seekers. Generate tailored interview prep,
                        ATS-optimized resumes, and career insights in seconds.
                    </motion.p>

                    <motion.div className='cta-group-v3' variants={itemVariants}>
                        {user ? (
                            <button 
                                className='button primary-button large glow-orange'
                                onClick={() => navigate('/interview-prep')}
                            >
                                <span>Go to Dashboard</span>
                                <ChevronRight size={18} />
                            </button>
                        ) : (
                            <>
                                <button 
                                    className='button primary-button large glow-orange'
                                    onClick={() => navigate('/register')}
                                >
                                    <span>Get Started Free</span>
                                    <ChevronRight size={18} />
                                </button>
                                <button 
                                    className='button secondary-button-v3 large'
                                    onClick={() => navigate('/login')}
                                >
                                    <span>Sign In</span>
                                    <ArrowUpRight size={18} />
                                </button>
                            </>
                        )}
                    </motion.div>

                    <motion.div className='hero-preview-v3' variants={itemVariants}>
                        <div className='preview-canvas-v3 glass-card'>
                            <div className='preview-nav'>
                                <div className='dots'><span></span><span></span><span></span></div>
                                <div className='url-bar'>ai-interview-coach.io</div>
                            </div>
                            <div className='preview-content'>
                                <div className='skeleton-line'></div>
                                <div className='skeleton-line short'></div>
                                <div className='skeleton-grid'>
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.section>

                <section className='benefits-v3'>
                    <div className='benefits-grid-v3'>
                        {[
                            { icon: <Zap />, title: 'Ludicrously Fast', desc: 'Complete interview strategy in under 30 seconds.' },
                            { icon: <Target />, title: 'ATS Optimized', desc: 'Beat the bots with resumes tailored for tracking systems.' },
                            { icon: <ShieldCheck />, title: 'High Trust', desc: 'Secure data handling and expert-vetted AI models.' }
                        ].map((b, i) => (
                            <motion.div
                                key={i}
                                className='benefit-card-v3 glass-card'
                                whileHover={{ y: -5 }}
                            >
                                <div className='benefit-icon-v3'>{b.icon}</div>
                                <h4>{b.title}</h4>
                                <p>{b.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    )
}

export default Landing
