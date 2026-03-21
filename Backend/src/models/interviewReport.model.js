const mongoose = require('mongoose');

/**
 * job description schema : String
 * resume text: String
 * Self descrption: String
 * 
 * matchscore: Number
 * 
 * Technical questions : 
 *  [{
 *  question: "",
 *  intention: "",
 *  answer: "",
 *  }]
 * 
 * Behavioral question:
 * [{
 *  question: "",
 *  intention: "",
 *  answer: "",
 * }]
 * Skill gaps:
 *  [{
 *  skill : "",
 *  severity:
 *      {
 *          type:String,
 *          enum: ["low","medium","high"]
 *      }
 * }]
 * preparation plan : 
 * [{
 *  day:Number,
 *  focus: String,
 *  tasks: [String]
 * }]
 */

const technicalQuestionsSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Technical question is required"]
    },
    intention: {
        type: String,
        required: [true, "Imtention is required"]
    },
    answer: {
        type: String,
        required: [true, "Answer is required"]
    }
}, {
    _id: false
})

const behavirolQuestionsSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Behavirol question is required"]
    },
    intention: {
        type: String,
        required: [true, "Imtention is required"]
    },
    answer: {
        type: String,
        required: [true, "Answer is required"]
    }
}, {
    _id: false
}
)


const skillGapsSchema = new mongoose.Schema({
skill : {
    type: String,
    required: [true, "Skill is required"]
},
severity:{
    type:String,
    enum: ["low", "medium", "high"],
    required: [true, "Severity is required"]
}
}, {
    _id: false
})

const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true, "Day is required"]
    },
    focus: {
        type: String,
        required: [true,"Focus is requird"]
    },
    tasks: [{
        type:String,
        required: [true,"Task is required"]

    }]
})

const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String,
        required: [true, "Job descrption is required"]
    },
    resume: {
        type: String,
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
    },
    technicalQuestions: [technicalQuestionsSchema],
    behavirolQuestions: [behavirolQuestionsSchema],
    skilGaps: [skillGapsSchema]

},
{
    timeStaps :true
}
)

const interviewReportModel = mongoose.model("InterviewReport", interviewReportSchema);

module.exports = interviewReportModel;
