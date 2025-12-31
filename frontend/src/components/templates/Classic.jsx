// frontend/src/components/templates/Classic.jsx
import React from "react";



function getLink(personal, ...keys) {
  for (const k of keys) {
    if (!personal) continue;
    if (personal[k]) return personal[k];
    if (personal.links && personal.links[k]) return personal.links[k];
  }
  return "";
}

function prettyDate(d) {
  if (!d) return "";
  if (typeof d !== "string") return String(d);
  // YYYY-MM or YYYY-MM-DD -> "MMM YYYY"
  const m = d.match(/^(\d{4})-(\d{2})/);
  if (m) {
    const date = new Date(d);
    if (!isNaN(date)) return date.toLocaleString(undefined, { month: "short", year: "numeric" });
  }
  const y = d.match(/^(\d{4})$/);
  if (y) return y[1];
  return d;
}

function dateRange(e) {
  if (!e) return "";
  const s = e.startDate || e.startYear || "";
  const end = e.endDate || e.endYear || "";
  return s || end ? `${prettyDate(s)}${s && end ? " — " : ""}${end ? prettyDate(end) : (end === "" ? "Present" : "")}`.trim() : "";
}

function arrToString(v) {
  if (!v && v !== 0) return "";
  return Array.isArray(v) ? v.join(" ") : String(v);
}

function Classic({ data = {} }) {
  const p = data.personal || {};
  const linkedin = getLink(p, "linkedin", "linkedIn");
  const github = getLink(p, "github");
  const portfolio = getLink(p, "portfolio", "portfolioUrl");
  const website = getLink(p, "website", "site");

  const education = Array.isArray(data.education) ? data.education : [];
  const experience = Array.isArray(data.experience) ? data.experience : [];
  const certifications = Array.isArray(data.certifications) ? data.certifications : [];
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const skills = Array.isArray(data.skills) ? data.skills : [];

  return (
    <div className="resume-page classic-root">
      <div className="classic-top">
        <h1 className="classic-name">{`${p.firstName || ""} ${p.lastName || ""}`.trim()}</h1>
        <div className="classic-title">{p.title || ""}</div>
        <div className="classic-contact">
          {p.email || ""}{p.email && (p.phone || p.location) ? " • " : ""}{p.phone || ""}{p.phone && p.location ? " • " : ""}{p.location || ""}
        </div>

        <div className="classic-links">
          {(() => {
            const els = [];
            if (linkedin) els.push(<a key="li" href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>);
            if (github) els.push(<a key="gh" href={github} target="_blank" rel="noopener noreferrer">GitHub</a>);
            if (portfolio) els.push(<a key="pf" href={portfolio} target="_blank" rel="noopener noreferrer">Portfolio</a>);
            if (website) els.push(<a key="ws" href={website} target="_blank" rel="noopener noreferrer">Website</a>);
            if (!els.length) return null;
            return els.reduce((acc, el, i) => i === 0 ? el : (<React.Fragment key={`frag${i}`}>{acc}{" • "}{el}</React.Fragment>), null);
          })()}
        </div>
      </div>

      <div className="classic-body">
        <section className="classic-section">
          <h3>Summary</h3>
          <div className="classic-entry-desc">{arrToString(data.summary || data.overview || [])}</div>
        </section>

        <section className="classic-section">
          <h3>Experience</h3>
          {(experience || []).map((ex, i) => (
            <div key={i} className="classic-entry">
              <div className="classic-entry-head">
                <div className="classic-entry-title">{ex.role || ex.position || ""}</div>
                <div className="classic-entry-sub">{ex.organization || ex.company || ""}</div>
                <div className="classic-entry-date">{dateRange(ex)}</div>
              </div>
              <div className="classic-entry-desc">{arrToString(ex.responsibilities || ex.description || [])}</div>
            </div>
          ))}
        </section>

        <section className="classic-section">
          <h3>Projects</h3>
          {(projects || []).map((pr, i) => {
            const name = pr.projectName || pr.title || pr.name || "";
            const desc = arrToString(pr.description || pr.summary || []);
            const techs = Array.isArray(pr.technologies) ? pr.technologies : (Array.isArray(pr.tech) ? pr.tech : []);
            const links = Array.isArray(pr.links) ? pr.links : (pr.link ? [pr.link] : []);
            return (
              <div key={i} className="classic-entry">
                <div className="classic-entry-head">
                  <div className="classic-entry-title">{name}</div>
                  <div className="classic-entry-date">{links.length ? links.map((l, idx) => <a key={idx} href={l} target="_blank" rel="noopener noreferrer">{l}</a>) : null}</div>
                </div>
                <div className="classic-entry-desc">{desc}</div>
                {techs.length ? <div className="classic-entry-sub small">Tech: {techs.join(", ")}</div> : null}
              </div>
            );
          })}
        </section>

        <section className="classic-section">
          <h3>Education</h3>
          {(education || []).map((ed, i) => (
            <div key={i} className="classic-entry">
              <div className="classic-entry-title">{ed.institution || ed.school || ""}</div>
              <div className="classic-entry-sub">{ed.degree || ed.field || ""}</div>
              <div className="classic-entry-date small">{dateRange(ed)}</div>
            </div>
          ))}
        </section>

        <section className="classic-section">
          <h3>Certifications</h3>
          {(certifications || []).map((c, i) => {
            const title = c.title || c.name || c.certification || "";
            const issuer = c.issuer || c.authority || "";
            const year = c.year || c.date || "";
            const link = c.link || c.url || c.href;
            return (
              <div key={i} className="classic-entry">
                <div className="classic-entry-title">{link ? <a href={link} target="_blank" rel="noopener noreferrer">{title}</a> : title}</div>
                {(issuer || year) ? <div className="classic-entry-sub small">{[issuer, year].filter(Boolean).join(" • ")}</div> : null}
              </div>
            );
          })}
        </section>

        <section className="classic-section">
          <h3>Skills</h3>
          <div className="classic-skills">
            {skills.map((s, i) => <span key={i} className="classic-skill">{typeof s === "string" ? s : (s && (s.name || s.title)) || ""}</span>)}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Classic;
