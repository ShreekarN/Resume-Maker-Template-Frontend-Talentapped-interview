// imports
const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  personal: {
    firstName: String,
    lastName: String,
    title: String,
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    github: String,
    portfolio: String
  },
  summary: String,
  skills: [String],
  experience: [{ role: String, organization: String, location: String, startDate: String, endDate: String, responsibilities: [String] }],
  projects: [{ projectName: String, description: [String], technologies: [String], links: [String] }],
  education: [{ degree: String, institution: String, fieldOfStudy: String, startYear: String, endYear: String, cgpa: String }],
  certifications: [{ name: String, link: String }]
}, { timestamps: true });

module.exports = mongoose.model('Resume', ResumeSchema);
