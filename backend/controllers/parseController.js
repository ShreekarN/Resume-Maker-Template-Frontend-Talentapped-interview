// imports
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// helper regex
const emailRx = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const phoneRx = /(\+?\d{1,4}[\s-])?(?:\d{10}|\d{3}[\s-]\d{3}[\s-]\d{4}|\(\d{3}\)\s*\d{3}[\s-]\d{4})/;

// simple parse
async function parsePdf(filePath) {
  const data = fs.readFileSync(filePath);
  const pdf = await pdfParse(data);
  return pdf.text;
}

async function parseDocx(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

// main parse function
async function parseFile(filePath, mimetype) {
  let text = '';
  if (mimetype === 'application/pdf') {
    text = await parsePdf(filePath);
  } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
             mimetype === 'application/msword') {
    text = await parseDocx(filePath);
  } else {
    // fallback read as text
    text = fs.readFileSync(filePath, 'utf8').toString();
  }

  // basic extraction
  const emailMatch = text.match(emailRx);
  const phoneMatch = text.match(phoneRx);
  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);

  // take first non-empty line as name/title candidate
  const firstLine = lines.length > 0 ? lines[0] : '';

  const parsed = {
    personal: {
      firstName: firstLine.split(' ')[0] || '',
      lastName: firstLine.split(' ').slice(1).join(' ') || '',
      title: '',
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      location: ''
    },
    summary: lines.slice(1, 6).join(' '), // short summary
    skills: [],
    experience: [],
    projects: [],
    education: [],
    certifications: []
  };

  return parsed;
}

module.exports = { parseFile };
