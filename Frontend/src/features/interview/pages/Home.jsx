import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    ClipboardList,
    FileText,
    User,
    Sparkles,
    ArrowRight,
    ChevronLeft,
    CheckCircle2,
    AlertCircle,
    Clock,
    Zap,
    ArrowUpRight,
    BookOpen,
    Target,
    TrendingUp,
    MessageSquare,
    ChevronDown,
    MapPin,
    Briefcase
} from 'lucide-react'
import '../style/home.scss'

const Home = () => {
    const navigate = useNavigate()
    const reportRef = useRef(null)
    const [jobDescription, setJobDescription] = useState(localStorage.getItem('lastJobDescription') || '')
    const [selfDescription, setSelfDescription] = useState(localStorage.getItem('lastSelfDescription') || '')
    const [resume, setResume] = useState(null)
    const [resumeName, setResumeName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [analysisData, setAnalysisData] = useState(null)
    const [jobs, setJobs] = useState([])
    const [jobsLoading, setJobsLoading] = useState(false)

    // Sync to localStorage
    useEffect(() => {
        localStorage.setItem('lastJobDescription', jobDescription)
        localStorage.setItem('lastSelfDescription', selfDescription)
    }, [jobDescription, selfDescription])

    const handleResumeSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            setResume(file)
            setResumeName(file.name)
        }
    }

    const handleGenerate = async () => {
        if (!jobDescription || !selfDescription) {
            setError('Both Job Description and Self Description are required.')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('jobDescription', jobDescription)
            formData.append('selfDescription', selfDescription)
            if (resume) formData.append('resume', resume)

            const response = await fetch('http://localhost:3000/api/interview/generate-report', {
                method: 'POST',
                credentials: 'include',
                body: formData
            })

            const result = await response.json()
            if (!response.ok) throw new Error(result.message || 'Failed to generate report')

            setAnalysisData(result.data)
            
            // Fetch Job Suggestions concurrently
            fetchSuggestions()

            // Auto-scroll to report
            setTimeout(() => {
                reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 300)
        } catch (err) {
            console.error('Error:', err)
            setError(err.message || 'Failed to generate interview report')
        } finally {
            setLoading(false)
        }
    }

    const fetchSuggestions = async () => {
        setJobsLoading(true)
        try {
            const response = await fetch('http://localhost:3000/api/jobs/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ selfDescription })
            })
            const result = await response.json()
            if (response.ok) {
                setJobs(result.data.jobs || [])
            }
        } catch (err) {
            console.error('Failed to fetch job suggestions:', err)
        } finally {
            setJobsLoading(false)
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    }

    return (
        <main className='home bento-layout'>
            <div className='mesh-bg'></div>
            
            <header className='bento-nav'>
                <Link to="/" className='back-link'>
                    <ChevronLeft size={18} />
                    <span>Back to Home</span>
                </Link>
                <div className='status-pill'>
                    <div className='indicator'></div>
                    <span>AI Engine Ready</span>
                </div>
            </header>

            <motion.div 
                className='home-content'
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.header className='home-header' variants={itemVariants}>
                    <h1 className='home-title'>Interview <span className='highlight'>Intelligence</span></h1>
                    <p className='home-subtitle'>Transform static data into a winning interview strategy.</p>
                </motion.header>

                <div className='bento-grid'>
                    <motion.div className='glass-card bento-item input-panel' variants={itemVariants}>
                        <div className='section-label'>
                            <ClipboardList size={20} className='icon-pink' />
                            <h3>Job Context</h3>
                        </div>
                        <textarea
                            placeholder="Paste the job description here. Mention key responsibilities and required technologies..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                    </motion.div>

                    <motion.div className='glass-card bento-item profile-panel' variants={itemVariants}>
                        <div className='section-label'>
                            <User size={20} className='icon-purple' />
                            <h3>Your Profile</h3>
                        </div>
                        <textarea
                            placeholder="Briefly describe your background, core strengths, and what you aim for..."
                            value={selfDescription}
                            onChange={(e) => setSelfDescription(e.target.value)}
                        />
                        
                        <label className='minimal-upload' htmlFor="resume">
                            <FileText size={16} />
                            <span>{resumeName || 'Attach PDF Resume (Optional)'}</span>
                            <input type="file" hidden id="resume" accept=".pdf" onChange={handleResumeSelect} />
                        </label>
                    </motion.div>

                    <motion.div className='bento-item action-panel' variants={itemVariants}>
                        <div className='action-stack'>
                            <button className='button primary-button glow full-width' onClick={handleGenerate} disabled={loading}>
                                {loading ? (
                                    <>
                                        <motion.div 
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                        >
                                            <Sparkles size={20} />
                                        </motion.div>
                                        <span>Synthesizing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={20} />
                                        <span>Generate Report</span>
                                    </>
                                )}
                            </button>
                            <button
                                className='button secondary-button full-width'
                                onClick={() => navigate('/interview-resume', {
                                    state: { jobDescription, selfDescription }
                                })}
                                disabled={!jobDescription || !selfDescription}
                            >
                                <ArrowRight size={20} />
                                <span>Build Tailored Resume</span>
                            </button>
                        </div>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }} 
                                animate={{ opacity: 1, x: 0 }}
                                className='error-toast'
                            >
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                <AnimatePresence>
                    {analysisData && (
                        <motion.section 
                            ref={reportRef}
                            className='report-dashboard'
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {/* Dashboard Header */}
                            <div className='dashboard-header'>
                                <div className='dash-title'>
                                    <TrendingUp size={22} />
                                    <h2>Your Interview <span className='highlight'>Report</span></h2>
                                </div>
                                <p className='dash-subtitle'>AI-powered analysis based on your profile and target role.</p>
                            </div>

                            {/* Hero Score Banner */}
                            <div className='score-banner'>
                                <div className='score-ring-wrap'>
                                    <svg viewBox="0 0 120 120" className='score-svg'>
                                        <circle cx="60" cy="60" r="52" className='ring-bg' />
                                        <motion.circle 
                                            cx="60" cy="60" r="52" 
                                            className='ring-progress'
                                            strokeDasharray={2 * Math.PI * 52}
                                            initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                                            animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - (analysisData.roleFit || analysisData.matchScore || 0) / 100) }}
                                            transition={{ duration: 1.8, ease: 'easeOut' }}
                                        />
                                    </svg>
                                    <div className='score-center'>
                                        <span className='score-value'>{analysisData.roleFit || analysisData.matchScore || 0}</span>
                                        <span className='score-percent'>%</span>
                                    </div>
                                </div>
                                <div className='score-info'>
                                    <h3>Role Fit Score</h3>
                                    <p>Based on your skills, experience, and the job requirements.</p>
                                    <div className='score-bar-track'>
                                        <motion.div 
                                            className='score-bar-fill'
                                            initial={{ width: 0 }}
                                            animate={{ width: `${analysisData.roleFit || analysisData.matchScore || 0}%` }}
                                            transition={{ duration: 1.5, ease: 'easeOut' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Two Column: Skill Gaps + Preparation */}
                            <div className='dashboard-grid-2col'>
                                {/* Skill Gaps Panel */}
                                <div className='dash-panel'>
                                    <div className='panel-header'>
                                        <Target size={18} className='icon-orange' />
                                        <h3>Skill Gaps</h3>
                                    </div>
                                    <div className='gaps-list'>
                                        {(analysisData.skillGaps || analysisData.skillsGap || []).map((gap, i) => (
                                            <motion.div 
                                                key={i} 
                                                className='gap-row'
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.08 }}
                                            >
                                                <span className='gap-skill'>{gap.skill}</span>
                                                <span className={`severity-pill ${(gap.severity || gap.importance || 'low').toLowerCase()}`}>
                                                    {gap.severity || gap.importance}
                                                </span>
                                            </motion.div>
                                        ))}
                                        {(analysisData.skillGaps || analysisData.skillsGap || []).length === 0 && (
                                            <p className='empty-state'>No significant gaps detected. Great match!</p>
                                        )}
                                    </div>
                                </div>

                                {/* Preparation Roadmap Panel */}
                                <div className='dash-panel'>
                                    <div className='panel-header'>
                                        <BookOpen size={18} className='icon-orange' />
                                        <h3>Preparation Roadmap</h3>
                                    </div>
                                    <div className='roadmap-timeline'>
                                        {(analysisData.preparationPlan || analysisData.preparationRoadmap || []).map((day, i) => (
                                            <motion.div 
                                                key={i} 
                                                className='timeline-item'
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                            >
                                                <div className='timeline-marker'>
                                                    <div className='marker-dot' />
                                                    {i < (analysisData.preparationPlan || analysisData.preparationRoadmap || []).length - 1 && <div className='marker-line' />}
                                                </div>
                                                <div className='timeline-content'>
                                                    <h4>Day {day.day} — {day.focus}</h4>
                                                    <ul>
                                                        {day.tasks?.map((task, j) => <li key={j}>{task}</li>)}
                                                    </ul>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Questions Section - Full Width */}
                            <div className='dash-panel questions-full'>
                                <div className='panel-header'>
                                    <MessageSquare size={18} className='icon-orange' />
                                    <h3>Anticipated Interview Questions</h3>
                                    <span className='q-count'>
                                        {[...(analysisData.technicalQuestions || []), ...(analysisData.behavioralQuestions || [])].length} questions
                                    </span>
                                </div>
                                <div className='questions-grid'>
                                    {[...(analysisData.technicalQuestions || []), ...(analysisData.behavioralQuestions || [])].map((q, i) => (
                                        <motion.div 
                                            key={i} 
                                            className='question-card'
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                        >
                                            <div className='q-header'>
                                                <span className='q-num'>{String(i + 1).padStart(2, '0')}</span>
                                                <p className='q-text'>{q.question}</p>
                                            </div>
                                            <div className='q-details'>
                                                <div className='q-detail-block'>
                                                    <span className='detail-label'>Why they ask this</span>
                                                    <p>{q.intention || q.insights}</p>
                                                </div>
                                                <div className='q-detail-block'>
                                                    <span className='detail-label'>Suggested approach</span>
                                                    <p>{q.answer || q.strategy}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Job Suggestions Section */}
                            <div className='dash-panel suggestions-section'>
                                <div className='panel-header'>
                                    <Briefcase size={18} className='icon-orange' />
                                    <h3>Tailored Job Opportunities</h3>
                                    <span className='s-tag'>Live matches</span>
                                </div>
                                
                                {jobsLoading ? (
                                    <div className='loading-micro'>
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                            <Sparkles size={24} className='icon-orange' />
                                        </motion.div>
                                        <p>Searching for best matches...</p>
                                    </div>
                                ) : jobs.length > 0 ? (
                                    <div className='job-suggestions-grid'>
                                        {jobs.map((job, i) => (
                                            <motion.div 
                                                key={i} 
                                                className='job-card'
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                            >
                                                <div className='job-main'>
                                                    <div className='job-info-wrap'>
                                                        <h4>{job.title}</h4>
                                                        <p className='company'>{job.company}</p>
                                                        <div className='meta'>
                                                            <MapPin size={12} />
                                                            <span>{job.location}</span>
                                                        </div>
                                                    </div>
                                                    <div className='match-pill'>
                                                        <Zap size={10} />
                                                        <span>{job.matchScore || 0}% Match</span>
                                                    </div>
                                                </div>
                                                <a 
                                                    href={job.applyLink} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className='apply-btn'
                                                >
                                                    View & Apply <ArrowUpRight size={14} />
                                                </a>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className='empty-jobs'>
                                        <p>No immediate suggestions found. Try broadening your profile summary.</p>
                                    </div>
                                )}
                            </div>
                        </motion.section>

                    )}
                </AnimatePresence>
            </motion.div>
        </main>
    )
}

export default Home