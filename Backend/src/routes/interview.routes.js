const express  = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const interviewController   = require("../controllers/interview.controller")
const interviewRouter = express.Router()
const upload = require("../middlewares/file.middleware")


/**
 * @route POST /api/interview/generate-report
 * @description generate new interview report on the basis of user self description, resume, pdf and job description
 * @access private
 */

interviewRouter.post("/generate-report", authMiddleware.authUser, upload.single("resume"), interviewController.generateInterviewReportController)

/**
 * @route POST /api/interview/generate-ats-resume
 * @description generate ATS-friendly resume based on user resume, job description and self description
 * @access private
 */
interviewRouter.post("/generate-ats-resume", authMiddleware.authUser, upload.single("resume"), interviewController.generateATSResumeController)

/**
 * @route POST /api/interview/generate-resume-html
 * @description generate HTML resume for preview
 * @access private
 */
interviewRouter.post("/generate-resume-html", authMiddleware.authUser, upload.single("resume"), interviewController.generateResumeHtmlController)

module.exports = interviewRouter