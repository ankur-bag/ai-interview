const axios = require('axios')
const { GoogleGenAI } = require('@google/genai')
const JobSuggestion = require('../models/jobSuggestion.model')

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })
const APIFY_API_KEY = process.env.APIFY_API_KEY

/**
 * Extract skills from selfDescription using Gemini and generate a job search query
 */
async function extractSkillsAndQuery(selfDescription) {
    const prompt = `Analyze this candidate's self description and extract key information.

Self Description:
${selfDescription}

Return a JSON object with:
1. "skills": array of technical/professional skills (e.g. ["React", "Node.js", "Python", "Machine Learning"])
2. "searchQuery": a short, effective job search query for Indeed (e.g. "MERN stack developer" or "Frontend React developer" or "Python data scientist"). Keep it to 2-4 words max.

Return ONLY the JSON object, no other text.`

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    })

    const text = response.candidates[0].content.parts[0].text
    try {
        return JSON.parse(text)
    } catch {
        // Fallback: try to clean markdown code blocks
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        return JSON.parse(cleaned)
    }
}

/**
 * Fetch jobs from Apify Indeed scraper actor
 */
async function fetchJobsFromApify(searchQuery, location = 'India') {
    const ACTOR_ID = 'hMvNSpz3JnHgl5jkh' // Indeed Scraper actor
    const url = `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_API_KEY}`

    const input = {
        position: searchQuery,
        country: "IN",
        location: location,
        maxItems: 15,
        parseCompanyDetails: false,
        saveOnlyUniqueItems: true,
        followApplyRedirects: false,
    }

    try {
        const response = await axios.post(url, input, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 120000 // 2 minute timeout for scraping
        })

        if (!response.data || !Array.isArray(response.data)) {
            return []
        }

        // Normalize Apify response to our schema
        return response.data.map(job => ({
            title: job.positionName || job.title || 'Unknown Position',
            company: job.company || 'Unknown Company',
            location: job.location || location,
            description: job.description || '',
            applyLink: job.url || job.externalApplyLink || '',
            matchScore: 0
        }))
    } catch (error) {
        console.error('Apify API error:', error.message)
        throw new Error('Failed to fetch jobs from Apify. Please try again later.')
    }
}

/**
 * Score jobs by matching extracted skills against job descriptions
 */
function scoreJobs(skills, jobs) {
    if (!skills || skills.length === 0 || !jobs || jobs.length === 0) return jobs

    const normalizedSkills = skills.map(s => s.toLowerCase().trim())

    return jobs.map(job => {
        const jobText = `${job.title} ${job.description} ${job.company}`.toLowerCase()

        let matchCount = 0
        normalizedSkills.forEach(skill => {
            // Check for exact word or partial match (e.g. "react" matches "reactjs")
            if (jobText.includes(skill)) {
                matchCount++
            }
        })

        const matchScore = Math.min(100, Math.round((matchCount / normalizedSkills.length) * 100))

        return { ...job, matchScore }
    })
}

/**
 * Check MongoDB cache or fetch fresh results
 */
async function getCachedOrFetchJobs(searchQuery, location = 'India') {
    // Check cache first
    const cached = await JobSuggestion.findOne({
        searchQuery: searchQuery.toLowerCase(),
        location: location.toLowerCase()
    })

    if (cached) {
        console.log(`[Jobs] Cache hit for "${searchQuery}" in "${location}"`)
        return cached.jobs
    }

    // Fetch from Apify
    console.log(`[Jobs] Cache miss — fetching from Apify for "${searchQuery}" in "${location}"`)
    const jobs = await fetchJobsFromApify(searchQuery, location)

    // Cache results if we got any
    if (jobs.length > 0) {
        await JobSuggestion.create({
            searchQuery: searchQuery.toLowerCase(),
            location: location.toLowerCase(),
            jobs
        })
    }

    return jobs
}

/**
 * Main function: suggest jobs based on selfDescription
 */
async function suggestJobs(selfDescription) {
    // Step 1: Extract skills and generate search query
    const { skills, searchQuery } = await extractSkillsAndQuery(selfDescription)

    if (!searchQuery) {
        throw new Error('Could not determine job search query from your profile')
    }

    // Step 2: Fetch jobs (cached or fresh)
    const rawJobs = await getCachedOrFetchJobs(searchQuery, 'India')

    if (!rawJobs || rawJobs.length === 0) {
        return { searchQuery, skills, jobs: [] }
    }

    // Step 3: Score and sort by matchScore
    const scoredJobs = scoreJobs(skills, rawJobs)
    const topJobs = scoredJobs
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5)

    return {
        searchQuery,
        skills,
        jobs: topJobs
    }
}

module.exports = { suggestJobs, extractSkillsAndQuery }
