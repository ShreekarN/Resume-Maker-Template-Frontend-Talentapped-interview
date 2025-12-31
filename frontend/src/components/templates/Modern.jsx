// frontend/src/components/templates/Modern.jsx
import React from "react";



function pickLink(personal, ...keys) {
  for (const k of keys) {
    if (!personal) continue;
    if (personal[k]) return personal[k];
    if (personal.links && personal.links[k]) return personal.links[k];
  }
  return "";
}

function formatDate(d) {
  if (!d) return "";
  if (typeof d !== "string") return String(d);
  const m = d.match(/^(\d{4})-(\d{2})/);
  if (m) {
    const dt = new Date(d);
    if (!isNaN(dt)) return dt.toLocaleString(undefined, { month: "short", year: "numeric" });
  }
  const y = d.match(/^(\d{4})$/);
  if (y) return y[1];
  return d;
}

function dateRange(item) {
  if (!item) return "";
  const s = item.startDate || item.startYear || "";
  const e = item.endDate || item.endYear || "";
  return s || e ? `${formatDate(s)}${s && e ? " — " : ""}${e ? formatDate(e) : (e === "" ? "Present" : "")}` : "";
}

function joinDesc(x) {
  if (!x && x !== 0) return "";
  return Array.isArray(x) ? x.join(" ") : String(x);
}

export default function Modern({ data = {} }) {
  const p = data.personal || {};
  const linkedin = pickLink(p, "linkedin", "linkedIn");
  const github = pickLink(p, "github");
  const portfolio = pickLink(p, "portfolio");
  const website = pickLink(p, "website");

  const skills = Array.isArray(data.skills) ? data.skills : [];
  const experience = Array.isArray(data.experience) ? data.experience : [];
  const education = Array.isArray(data.education) ? data.education : [];
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const certifications = Array.isArray(data.certifications) ? data.certifications : [];

  return (
    <div className="resume-page modern-root">
      <div className="modern-left">
        <h2 style={{ margin: 0 }}>{p.firstName || ""}</h2>
        <h2 style={{ margin: 0 }}>{p.lastName || ""}</h2>
        <p style={{ marginTop: 6 }}>{p.title || ""}</p>
        <hr style={{ borderColor: "rgba(0,0,0,0.08)", margin: "8px 0" }} />
        <p style={{ fontSize: 11 }}>{p.email || ""}</p>
        <p style={{ fontSize: 11 }}>{p.phone || ""}</p>
        <p style={{ fontSize: 11 }}>{p.location || ""}</p>

        <div className="modern-links" style={{ marginTop: 12 }}>
          {linkedin ? <div><a href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></div> : null}
          {github ? <div><a href={github} target="_blank" rel="noopener noreferrer">GitHub</a></div> : null}
          {portfolio ? <div><a href={portfolio} target="_blank" rel="noopener noreferrer">Portfolio</a></div> : null}
          {website ? <div><a href={website} target="_blank" rel="noopener noreferrer">Website</a></div> : null}
        </div>

        <section className="modern-section" style={{ marginTop: 16 }}>
          <h4>Skills</h4>
          <div className="modern-skills">
            {skills.map((s, i) => <div key={i} className="modern-skill">{typeof s === "string" ? s : (s && (s.name || s.title)) || ""}</div>)}
          </div>
        </section>
      </div>

      <div className="modern-right">
        <section className="modern-section">
          <h3>Experience</h3>
          {experience.map((ex, i) => (
            <div key={i} className="modern-entry">
              <div className="modern-entry-head">
                <div className="modern-entry-title">{ex.role || ex.position || ""}</div>
                <div className="modern-entry-sub">{ex.organization || ex.company || ""}</div>
                <div className="modern-entry-date small">{dateRange(ex)}</div>
              </div>
              <div className="modern-entry-desc">{joinDesc(ex.responsibilities || ex.description)}</div>
            </div>
          ))}
        </section>

        <section className="modern-section">
          <h3>Projects</h3>
          {projects.map((pr, i) => {
            const name = pr.projectName || pr.title || pr.name || "";
            const desc = joinDesc(pr.description || pr.summary || "");
            const techs = Array.isArray(pr.technologies) ? pr.technologies : (Array.isArray(pr.tech) ? pr.tech : []);
            const links = Array.isArray(pr.links) ? pr.links : (pr.link ? [pr.link] : []);
            return (
              <div key={i} className="modern-entry">
                <div className="modern-entry-title">{name}</div>
                {links.length ? <div className="modern-entry-links">{links.map((l,idx) => <a key={idx} href={l} target="_blank" rel="noopener noreferrer">{l}</a>)}</div> : null}
                <div className="modern-entry-desc">{desc}</div>
                {techs.length ? <div className="modern-entry-sub small">Tech: {techs.join(", ")}</div> : null}
              </div>
            );
          })}
        </section>

        <section className="modern-section">
          <h3>Education</h3>
          {education.map((ed, i) => (
            <div key={i} className="modern-entry">
              <div className="modern-entry-title">{ed.institution || ed.school || ""}</div>
              <div className="modern-entry-sub">{ed.degree || ed.field || ""}</div>
              <div className="modern-entry-date small">{dateRange(ed)}</div>
            </div>
          ))}
        </section>

        <section className="modern-section">
          <h3>Certifications</h3>
          {certifications.map((c, i) => {
            const title = c.title || c.name || "";
            const link = c.link || c.url || c.href;
            const issuer = c.issuer || c.authority || "";
            const year = c.year || c.date || "";
            return (
              <div key={i} className="modern-entry">
                <div className="modern-entry-title">{link ? <a href={link} target="_blank" rel="noopener noreferrer">{title}</a> : title}</div>
                {(issuer || year) ? <div className="modern-entry-sub small">{[issuer, year].filter(Boolean).join(" • ")}</div> : null}
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
