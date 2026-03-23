const pdfParse = require("pdf-parse")
const {generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")




/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterviewReportController(req, res) {

    const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
    const { selfDescription, jobDescription } = req.body

    const interviewReportByAi = await generateInterviewReport({
        resume: resumeContent.text,
        selfDescription,
        jobDescription
    })

    console.log("AI Response:", JSON.stringify(interviewReportByAi, null, 2))

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeContent.text,
        selfDescription,
        jobDescription,
        matchScore: interviewReportByAi.matchScore || 0,
        technicalQuestions: Array.isArray(interviewReportByAi.technicalQuestions) ? interviewReportByAi.technicalQuestions : [],
        behavioralQuestions: Array.isArray(interviewReportByAi.behavioralQuestions) ? interviewReportByAi.behavioralQuestions : [],
        skillGaps: Array.isArray(interviewReportByAi.skillGaps) ? interviewReportByAi.skillGaps : [],
        preparationPlan: Array.isArray(interviewReportByAi.preparationPlan) ? interviewReportByAi.preparationPlan : [],
        title: interviewReportByAi.title || ""
    })

    res.status(201).json({
        message: "Interview report generated successfully.",
        interviewReport
    })

}

module.exports = { generateInterviewReportController }