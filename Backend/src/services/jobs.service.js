const axios = require('axios')
const { GoogleGenAI } = require('@google/genai')
const JobSuggestion = require('../models/jobSuggestion.model')

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })
const APIFY_API_KEY = process.env.APIFY_API_KEY

/**
 * Extract skills from selfDescription using Gemini and generate a job search query
 */
async function extractSkillsAndQuery(selfDescription) {
    console.log(`[Jobs] Extracting skills from selfDescription (length: ${selfDescription.length})`)
    const prompt = `Analyze this candidate's self description and extract key information.

Self Description:
${selfDescription}

Return a JSON object with:
1. "skills": array of technical/professional skills (e.g. ["React", "Node.js", "Python", "Machine Learning"])
2. "searchQuery": a short, effective job search query for Indeed (e.g. "MERN stack developer" or "Frontend React developer" or "Python data scientist"). Keep it to 2-4 words max.

Return ONLY the JSON object, no other text.`

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        })

        const text = response.candidates[0].content.parts[0].text
        const data = JSON.parse(text)
        console.log(`[Jobs] Extracted Query: "${data.searchQuery}", Skills: [${data.skills?.join(', ')}]`)
        return data
    } catch (err) {
        console.error('[Jobs] Gemini extraction failed:', err.message)
        // Fallback query if AI fails
        return { 
            skills: ['Full Stack'], 
            searchQuery: selfDescription.split(' ').slice(0, 3).join(' ') || 'Software Engineer' 
        }
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
        maxItems: 12,
        parseCompanyDetails: false,
        saveOnlyUniqueItems: true,
        followApplyRedirects: false,
    }

    console.log(`[Jobs] Requesting Apify Indeed Scraper for queries: "${searchQuery}" in "${location}"`)
    try {
        const response = await axios.post(url, input, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000 // 1 minute timeout
        })

        if (!response.data || !Array.isArray(response.data)) {
            console.log('[Jobs] Apify returned no items.')
            return []
        }

        console.log(`[Jobs] Apify found ${response.data.length} raw items.`)

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
        console.error('[Jobs] Apify API error:', error.response?.data || error.message)
        return [] // Return empty list rather than crashing
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
    const cached = await JobSuggestion.findOne({
        searchQuery: searchQuery.toLowerCase(),
        location: location.toLowerCase()
    })

    if (cached) {
        console.log(`[Jobs] Cache hit for "${searchQuery}"`)
        return cached.jobs
    }

    const jobs = await fetchJobsFromApify(searchQuery, location)

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
    try {
        const { skills, searchQuery } = await extractSkillsAndQuery(selfDescription)

        if (!searchQuery) {
            console.warn('[Jobs] No searchQuery extracted.')
            return { searchQuery: '', skills: [], jobs: [] }
        }

        const rawJobs = await getCachedOrFetchJobs(searchQuery, 'India')

        if (!rawJobs || rawJobs.length === 0) {
            console.log('[Jobs] No jobs found for query.')
            return { searchQuery, skills, jobs: [] }
        }

        const scoredJobs = scoreJobs(skills, rawJobs)
        const topJobs = scoredJobs
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 6)

        console.log(`[Jobs] Returning ${topJobs.length} scored jobs.`)
        return {
            searchQuery,
            skills,
            jobs: topJobs
        }
    } catch (err) {
        console.error('[Jobs] suggestJobs main error:', err.message)
        return { searchQuery: 'Error', skills: [], jobs: [] }
    }
}

module.exports = { suggestJobs, extractSkillsAndQuery }
