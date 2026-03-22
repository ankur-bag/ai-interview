const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const { selfDescription } = require("./temp")
const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const interviewReportSchema = z.object({

    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job description"),

    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question that can be asked in the interview"),
        intention: z.string().describe("The intention of the interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question — what points to cover, what approach to take, etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),

    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The behavioral question that can be asked in the interview"),
        intention: z.string().describe("The intention of the interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question — what points to cover, what approach to take, etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),

    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of the skill gap — low: nice to have, medium: important, high: critical blocker"),
    })).describe("List of skill gaps in the candidate's profile along with their severity"),

    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main topic or theme to focus on for this day"),
        tasks: z.array(z.string()).describe("List of specific actionable tasks to prepare and complete on this day")
    })).describe("A day wise preparation plan for the candidate to follow in order to preparee for the interview"),
})


async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `You are an expert interview coach and technical recruiter. Analyze the candidate's profile and generate a structured interview report.

You MUST respond strictly according to the provided JSON schema. Do not add any extra fields.

Candidate Details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Instructions:
- matchScore: Rate 0-100 how well the candidate matches the job description
- technicalQuestions:Should mainatain the schema properly ,  Generate 5-7 relevant technical questions based on the resume and JD , first - Question , then its Intention and finally its answer
- behavioralQuestions: Should mainatain the schema properly ,Generate 4-5 behavioral questions based on the candidate's background, first - Question , then its Intention and finally its answer
- skillGaps: Identify skills mentioned in the JD that are missing or weak in the resume and also mention its severity [low , medium , high] (according to the schema)
- preparationPlan: Create a 7-day (day wise) preparation plan targeting the skill gaps
`

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema)
        }
    })

    return JSON.parse(response.text)

}

module.exports = generateInterviewReport