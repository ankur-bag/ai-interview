const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


    const prompt = `You are an expert technical interviewer and career coach.

CRITICAL INSTRUCTION: Return ONLY valid JSON with ACTUAL VALUES, not key names.

WRONG FORMAT (DO NOT RETURN THIS):
{"technicalQuestions": ["question", "intention", "answer"]}

CORRECT FORMAT (RETURN THIS):
{"technicalQuestions": [{"question": "What is X?", "intention": "To test Y", "answer": "The answer is..."}]}

Generate a complete JSON interview report with:

{
  "title": "string - job title",
  "matchScore": number (0-100),
  
  "technicalQuestions": [
    {
      "question": "actual question",
      "intention": "what skill this tests",
      "answer": "detailed answer"
    }
  ],
  
  "behavioralQuestions": [
    {
      "question": "tell me about...",
      "intention": "what this evaluates",
      "answer": "STAR format answer"
    }
  ],
  
  "skillGaps": [
    {
      "skill": "skill name",
      "severity": "low|medium|high"
    }
  ],
  
  "preparationPlan": [
    {
      "day": number,
      "focus": "what to learn",
      "tasks": ["task1", "task2"]
    }
  ]
}

REQUIREMENTS:
- At least 5 technical questions with full Q&A
- At least 5 behavioral questions with full Q&A  
- At least 3 skill gaps
- At least 7 days of planning with tasks

Resume:
${resume}

Job Description:
${jobDescription}

Self Description:
${selfDescription}
`;


    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            temperature: 0.7,
            responseMimeType: "application/json"
        }
    })

    const rawText = response.candidates[0].content.parts[0].text
    let parsedResponse = JSON.parse(rawText)
    
    // Reconstruct objects from flattened arrays if needed
    const reconstructArray = (arr, objectKeys) => {
        if (!Array.isArray(arr) || arr.length === 0) return []
        
        // If first item is a string (flattened), reconstruct
        if (typeof arr[0] === 'string' && objectKeys.includes(arr[0])) {
            const result = []
            for (let i = 0; i < arr.length; i += objectKeys.length) {
                const obj = {}
                objectKeys.forEach((key, idx) => {
                    obj[key] = arr[i + idx] || ""
                })
                result.push(obj)
            }
            return result
        }
        return arr
    }
    
    const fixedResponse = {
        title: parsedResponse.title || "Interview Report",
        matchScore: typeof parsedResponse.matchScore === 'number' ? parsedResponse.matchScore : 0,
        technicalQuestions: reconstructArray(parsedResponse.technicalQuestions, ["question", "intention", "answer"]),
        behavioralQuestions: reconstructArray(parsedResponse.behavioralQuestions, ["question", "intention", "answer"]),
        skillGaps: reconstructArray(parsedResponse.skillGaps, ["skill", "severity"]),
        preparationPlan: reconstructArray(parsedResponse.preparationPlan, ["day", "focus", "tasks"])
    }
    
    // Filter out empty entries
    fixedResponse.technicalQuestions = fixedResponse.technicalQuestions.filter(q => q.question && q.question.length > 1)
    fixedResponse.behavioralQuestions = fixedResponse.behavioralQuestions.filter(q => q.question && q.question.length > 1)
    fixedResponse.skillGaps = fixedResponse.skillGaps.filter(s => s.skill && s.skill.length > 1)
    fixedResponse.preparationPlan = fixedResponse.preparationPlan.filter(p => p.day && typeof p.day === 'number')
    
    return fixedResponse


}



async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })


    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

module.exports = { generateInterviewReport, generateResumePdf }