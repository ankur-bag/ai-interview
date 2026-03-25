const pdfParse = require("pdf-parse")
const { 
    generateInterviewReport, 
    generateATSResume, 
    generateResumePdfData 
} = require("../services/ai.service")

const interviewReportModel = require("../models/interviewReport.model")




/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterviewReportController(req, res) {
    try {
        const { selfDescription, jobDescription } = req.body
        let resumeText = ""

        if (req.file?.buffer) {
            const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
            resumeText = resumeContent.text
        }

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interviewReportByAi
        })

        res.status(201).json({
            message: "Interview report generated successfully.",
            data: {
                ...interviewReport.toObject(),
                roleFit: interviewReport.matchScore // Align with frontend roleFit
            }
        })
    } catch (error) {
        if (error?.isModelBusy) {
            console.error("Model busy while generating interview report:", error.message)
            return res.status(503).json({
                message: error.userMessage || "AI service is temporarily busy. Please try again shortly.",
                error: error.message
            })
        }

        console.error("Error generating interview report:", error.message)
        res.status(400).json({
            message: "Failed to generate interview report",
            error: error.message
        })
    }

}

/**
 * @description Controller to generate ATS-friendly resume
 */
async function generateATSResumeController(req, res) {
    try {
        const { selfDescription, jobDescription, personalInfo } = req.body
        let resumeText = ""

        if (req.file?.buffer) {
            const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
            resumeText = resumeContent.text
        }

        const pdfBuffer = await generateATSResume({
            resume: resumeText,
            selfDescription,
            jobDescription,
            personalInfo
        })

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'attachment; filename="ATS_Resume.pdf"')
        res.send(pdfBuffer)
    } catch (error) {
        if (error?.isModelBusy) {
            console.error("Model busy while generating ATS resume:", error.message)
            return res.status(503).json({
                message: error.userMessage || "AI service is temporarily busy. Please try again shortly.",
                error: error.message
            })
        }

        console.error("Error generating ATS resume:", error.message)
        res.status(500).json({
            message: "Failed to generate ATS resume",
            error: error.message
        })
    }
}

/**
 * @description Controller to generate HTML resume for preview
 */
async function generateResumeHtmlController(req, res) {
    try {
        const { selfDescription, jobDescription, personalInfo } = req.body
        let resumeText = ""

        if (req.file?.buffer) {
            const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
            resumeText = resumeContent.text
        }

        const resumeData = await generateResumePdfData({
            resume: resumeText,
            selfDescription,
            jobDescription,
            personalInfo
        })

        res.status(200).json({
            message: "Resume HTML generated successfully.",
            data: resumeData.html
        })
    } catch (error) {
        console.error("Error generating resume HTML:", error.message)
        res.status(500).json({
            message: "Failed to generate resume HTML",
            error: error.message
        })
    }
}

module.exports = {
    generateInterviewReportController,
    generateATSResumeController,
    generateResumeHtmlController
}