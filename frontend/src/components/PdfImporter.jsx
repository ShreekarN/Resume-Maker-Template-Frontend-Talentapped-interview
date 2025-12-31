// frontend/src/components/PdfImporter.jsx
import React from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

/**
 * PdfImporter
 * ✔ Worker setup
 * ✔ Vite compatible
 * ✔ ES module worker
 * ✔ No mutations
 * ✔ No CDN
 * ✔ No public
 * ✔ Minimal change
 */

// critical worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

console.log(
  "[PdfImporter] workerSrc resolved to:",
  pdfjsLib.GlobalWorkerOptions.workerSrc
);

export default function PdfImporter({ onParsed }) {
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("[PdfImporter] file selected:", file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
      }).promise;

      console.log(
        `[PdfImporter] PDF loaded (${pdf.numPages} pages)`
      );

      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((it) => it.str)
          .join(" ");
        fullText += pageText + "\n";
      }

      const parsed = parseResumeText(fullText);
      console.log("[PdfImporter] parsed:", parsed);

      if (typeof onParsed === "function") {
        onParsed(parsed);
      }
    } catch (err) {
      console.error("[PdfImporter] parse failed:", err);
    }
  };

  return (
    <div className="pdf-importer" style={{ marginTop: 6 }}>
      <label style={{ fontSize: 13, display: "block", marginBottom: 4 }}>
        Upload resume PDF
      </label>
      <input type="file" accept="application/pdf" onChange={onFile} />
    </div>
  );
}

/* resume parser */
/* short notes */
/* form tuned */

/**
 * parseResumeText
 * - returns parsed data
 * - output shape:
 *   personal fields
 *   summary text
 *   skills list
 *   experience list
 *   projects list
 *   education list
 *   certifications list
 */
function parseResumeText(text) {
  // normalize lines
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\u00A0/g, " ").trim())
    .filter(Boolean);

  const joined = lines.join("\n");

  // helpers
  const trim = (s = "") => (typeof s === "string" ? s.replace(/\s+/g, " ").trim() : "");
  const toUpperCompact = (s = "") => (s || "").replace(/\s+/g, "").toUpperCase();
  const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));

  // output object
  const out = {
    personal: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      portfolio: "",
      website: ""
    },
    summary: "",
    skills: [],
    experience: [],
    projects: [],
    education: [],
    certifications: []
  };

  // email
  const email = joined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (email) out.personal.email = trim(email[0]);

  // phone
  const phone = joined.match(/(\+?\d{1,3}[\s-]?)?(\d{10})/);
  if (phone) out.personal.phone = trim(phone[0]);

  // links
  const linkedin = joined.match(/https?:\/\/(www\.)?linkedin\.com\/[^\s)]+/i);
  if (linkedin) out.personal.linkedin = trim(linkedin[0]);
  const github = joined.match(/https?:\/\/(www\.)?github\.com\/[^\s)]+/i);
  if (github) out.personal.github = trim(github[0]);
  const httpLinks = Array.from(joined.matchAll(/https?:\/\/[^\s)]+/gi)).map(m => m[0]);
  // assign extras
  for (const h of httpLinks) {
    if (!out.personal.linkedin && /linkedin/i.test(h)) { out.personal.linkedin = h; continue; }
    if (!out.personal.github && /github/i.test(h)) { out.personal.github = h; continue; }
    if (!out.personal.portfolio) { out.personal.portfolio = h; continue; }
    if (!out.personal.website) { out.personal.website = h; continue; }
  }

  // name detect
  let name = "";
  // caps name
  for (let i = 0; i < Math.min(8, lines.length); i++) {
    const ln = lines[i];
    if (/^[A-Z\s]{3,}$/.test(ln) && ln.split(/\s+/).length <= 6 && !/\d/.test(ln) && ln.length < 60) {
      const compact = toUpperCompact(ln);
      if (!/DETAILS|PROFILE|TECHNICAL|SKILLS|EDUCATION|PROJECTS|CERTIFICATIONS|EMPLOYMENT/.test(compact)) {
        name = ln.replace(/\s{2,}/g, " ").trim();
        break;
      }
    }
  }
  // fallback name
  if (!name) {
    for (let i = 0; i < Math.min(12, lines.length); i++) {
      const ln = lines[i];
      if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+$/.test(ln) && ln.length < 60) {
        name = ln.trim();
        break;
      }
    }
  }
  out.personal.fullName = trim(name);

  // location
  for (let i = 0; i < Math.min(8, lines.length); i++) {
    const ln = lines[i];
    if (/,/.test(ln) && !/@/.test(ln) && ln.length < 80) {
      out.personal.location = trim(ln);
      break;
    }
  }

  // summary detect
  let sentinel = -1;
  if (out.personal.email) sentinel = lines.findIndex(l => l.includes(out.personal.email));
  if (sentinel === -1 && out.personal.fullName) sentinel = lines.findIndex(l => l.includes(out.personal.fullName));
  if (sentinel === -1 && out.personal.phone) sentinel = lines.findIndex(l => l.includes(out.personal.phone));
  if (sentinel >= 0) {
    const frag = [];
    for (let k = sentinel + 1; k <= sentinel + 5 && k < lines.length; k++) {
      if (lines[k].length > 30) frag.push(lines[k]);
      if (frag.join(" ").length > 200) break;
    }
    if (frag.length) out.summary = trim(frag.join(" "));
  }
  // fallback summary
  if (!out.summary) {
    const long = lines.find(l => l.length > 120);
    if (long) out.summary = trim(long);
  }

  // skills detect
  const skillCandidates = [];
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (/programming languages|technical skills|development tools|technologies|skills:/i.test(ln)) {
      skillCandidates.push(ln);
      for (let j = 1; j <= 4 && i + j < lines.length; j++) {
        skillCandidates.push(lines[i + j]);
      }
    }
    if (/,/.test(ln) && ln.length < 200 && /Java|Python|C\+\+|SQL|AWS|Spring|React|Flask|Tableau|Git|VS Code|Android/i.test(ln)) {
      skillCandidates.push(ln);
    }
  }
  // bullet skills
  lines.forEach((ln) => {
    if (/^•/.test(ln) && /programming|development|tools|tableau|sql|python|java|c\+\+/i.test(ln)) skillCandidates.push(ln);
  });

  const skillSet = new Set();
  skillCandidates.forEach((ln) => {
    const cleaned = ln.replace(/(programming languages|technical skills|development tools|technologies|skills:)/i, "");
    const tokens = cleaned.split(/[,•;\/|–—-]/).map(t => trim(t));
    tokens.forEach(t => {
      if (!t) return;
      if (/@|http|www|linkedin|github/i.test(t)) return;
      if (t.length < 2 || t.length > 60) return;
      skillSet.add(t);
    });
  });
  // popular skills
  const popular = ["Java", "C++", "C", "Python", "SQL", "Spring Boot", "REST APIs", "Flask", "VS Code", "Git", "AWS", "Tableau", "Android", "ARCore", "YOLOv5"];
  for (const p of popular) if (joined.includes(p)) skillSet.add(p);

  out.skills = uniq(Array.from(skillSet)).slice(0, 200);

  // projects collect
  const projectList = [];
  // bullet projects
  lines.forEach((ln) => {
    if (/^•/.test(ln)) {
      const txt = ln.replace(/^•\s*/, "").trim();
      if (txt.length > 20 && /project|app|system|prediction|detection|ARCore|YOLO|wildwatch|WILDWATCH|Interior|Inventory|Churn|semantic search|malware/i.test(txt)) {
        projectList.push(txt);
      }
      if (txt.length > 30 && /project|app|system|prediction|detection|ARCore|YOLO|Inventory|Churn/i.test(txt)) {
        projectList.push(txt);
      }
    }
  });
  // titled projects
  for (let i = 0; i < lines.length - 1; i++) {
    const a = lines[i], b = lines[i + 1];
    if (a === a.toUpperCase() && a.length < 40 && b.length > 20) {
      projectList.push(`${a} — ${b}`);
    }
  }
  out.projects = uniq(projectList).slice(0, 40).map(p => ({
    projectName: p.split(/[:\-—–\—]/)[0].slice(0, 120).trim(),
    description: [p.slice(0, 200).trim()],
    technologies: [],
    links: []
  }));

  // certifications
  const certLines = lines.filter(l => /(certificate|certified|completed|forage|coursera|ibm|deloitte|certificate earned|job simulation)/i.test(l));
  out.certifications = uniq(certLines).slice(0, 60).map(c => ({ name: trim(c), link: "" }));

  // education detect
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (/vishwakarma|institute|university|college|school|B\.?Tech|BTech|Bachelor|Class XII|Class X/i.test(ln)) {
      const institution = trim(ln);
      let detail = "";
      if (i + 1 < lines.length) detail = trim(lines[i + 1]);
      const yearMatch = (institution + " " + detail).match(/(19|20)\d{2}(?:\s*-\s*(?:Present|(19|20)\d{2}))?/);
      const years = yearMatch ? yearMatch[0] : "";
      const degree = (institution.match(/B\.?Tech|BTech|Bachelor|Class XII|Class X|Diploma|M\.?Tech|MBA|Master/i) || [""]).shift();
      let startYear = "", endYear = "";
      if (years) {
        const m = years.match(/(19|20)\d{2}/g);
        if (m && m.length) {
          startYear = m[0];
          endYear = m[1] || "";
        }
      }
      out.education.push({
        institution,
        degree: degree || "",
        startYear,
        endYear,
        raw: detail
      });
    }
  }
  // education dedupe
  if (out.education.length > 1) {
    const seen = new Set();
    out.education = out.education.filter(ed => {
      const key = ((ed.institution || "") + "|" + (ed.startYear || "")).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // experience detect
  const expCandidates = [];
  const dateRegex = /(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t)?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[\s\.,-]*\d{4}|(19|20)\d{2}\s*[-–]\s*(?:Present|(19|20)\d{2})|(19|20)\d{2}/i;
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (dateRegex.test(ln)) {
      const role = trim(lines[i - 1] || "");
      const org = trim(lines[i - 2] || lines[i - 1] || "");
      const yearsText = (ln.match(/(19|20)\d{2}(?:\s*-\s*(?:Present|(19|20)\d{2}))?/) || [""])[0];
      const monthRange = (ln.match(/(Jan(?:uary)?|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec).{0,8}\d{4}(\s*-\s*(Jan(?:uary)?|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec).{0,8}\d{4})?/i) || [""])[0];
      const toMonth = (s) => {
        if (!s) return "";
        const m1 = s.match(/(19|20)\d{2}/);
        const m2 = s.match(/(Jan(?:uary)?|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep(?:t)?(?:ember)?|Oct|Nov|Dec)[\s,.-]*\d{4}/i);
        if (m2) {
          const mm = m2[0].match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i)[0];
          const monthMap = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
          const mmShort = mm.slice(0,3);
          const year = m2[0].match(/\d{4}/)[0];
          return `${year}-${monthMap[mmShort] || "01"}`;
        }
        if (m1) return `${m1[0]}-01`;
        return "";
      };
      let from = "", to = "";
      if (monthRange) {
        const parts = monthRange.split(/\s*-\s*/);
        from = toMonth(parts[0]);
        to = parts[1] ? toMonth(parts[1]) : "";
      } else if (yearsText) {
        const parts = yearsText.split(/\s*-\s*/);
        from = parts[0] ? (parts[0].match(/\d{4}/) ? `${parts[0].match(/\d{4}/)[0]}-01` : "") : "";
        to = parts[1] ? (parts[1].match(/\d{4}/) ? `${parts[1].match(/\d{4}/)[0]}-01` : "") : "";
      }
      expCandidates.push({
        role: role,
        organization: org,
        location: "",
        startDate: from,
        endDate: to,
        responsibilities: []
      });
    }
  }
  // internship fallback
  if (!expCandidates.length) {
    const interns = lines.filter(l => /intern|internship|project|worked as/i.test(l));
    interns.slice(0, 6).forEach(l => expCandidates.push({ role: trim(l), organization: "", location: "", startDate: "", endDate: "", responsibilities: [] }));
  }
  out.experience = expCandidates.slice(0, 20);

  // final cleanup
  out.summary = trim(out.summary);
  out.personal.fullName = trim(out.personal.fullName);
  out.personal.email = trim(out.personal.email);
  out.personal.phone = trim(out.personal.phone);
  out.personal.location = trim(out.personal.location);
  out.skills = Array.isArray(out.skills) ? out.skills.map(s => trim(s)).filter(Boolean) : [];
  out.projects = Array.isArray(out.projects) ? out.projects.map(p => ({
    projectName: trim(p.projectName),
    description: Array.isArray(p.description) ? p.description.map(d => trim(d)).filter(Boolean) : (p.description ? [trim(p.description)] : []),
    technologies: Array.isArray(p.technologies) ? p.technologies.map(t => trim(t)).filter(Boolean) : [],
    links: Array.isArray(p.links) ? p.links.map(l => trim(l)).filter(Boolean) : []
  })) : [];
  out.certifications = Array.isArray(out.certifications) ? out.certifications.map(c => ({ name: trim(c.name || c), link: "" })) : [];
  out.education = Array.isArray(out.education) ? out.education.map(ed => ({
    institution: trim(ed.institution),
    degree: trim(ed.degree),
    startYear: trim(ed.startYear),
    endYear: trim(ed.endYear),
    raw: trim(ed.raw || "")
  })) : [];
  out.experience = Array.isArray(out.experience) ? out.experience.map(ex => ({
    role: trim(ex.role),
    organization: trim(ex.organization),
    location: trim(ex.location),
    startDate: trim(ex.startDate),
    endDate: trim(ex.endDate),
    responsibilities: Array.isArray(ex.responsibilities) ? ex.responsibilities.map(r => trim(r)).filter(Boolean) : []
  })) : [];

  return out;
}
