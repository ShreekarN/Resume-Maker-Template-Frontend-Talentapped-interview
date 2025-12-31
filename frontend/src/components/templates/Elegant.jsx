// frontend/src/components/templates/Elegant.jsx
import React from "react";



function getLink(personal, ...keys) {
  for (const k of keys) {
    if (!personal) continue;
    if (personal[k]) return personal[k];
    if (personal.links && personal.links[k]) return personal.links[k];
  }
  return "";
}

function pretty(d) {
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

function range(e) {
  if (!e) return "";
  const s = e.startDate || e.startYear || "";
  const en = e.endDate || e.endYear || "";
  return s || en ? `${pretty(s)}${s && en ? " — " : ""}${en ? pretty(en) : (en === "" ? "Present" : "")}` : "";
}

export default function Elegant({ data = {} }) {
  const p = data.personal || {};
  const linkedin = getLink(p, "linkedin", "linkedIn");
  const github = getLink(p, "github");
  const website = getLink(p, "website");
  const portfolio = getLink(p, "portfolio");

  const experience = Array.isArray(data.experience) ? data.experience : [];
  const education = Array.isArray(data.education) ? data.education : [];
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const certifications = Array.isArray(data.certifications) ? data.certifications : [];

  return (
    <div className="resume-page elegant-root">
      <header className="elegant-header">
        <div className="elegant-name">{`${p.firstName || ""} ${p.lastName || ""}`.trim()}</div>
        <div className="elegant-title">{p.title || ""}</div>
        <div className="elegant-contact">{[p.email, p.phone, p.location].filter(Boolean).join(" • ")}</div>

        <div className="elegant-links">
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
      </header>

      <div className="elegant-body">
        <div className="elegant-left">
          <section className="elegant-section">
            <h4>Profile</h4>
            <div className="elegant-desc">{Array.isArray(data.summary) ? data.summary.join(" ") : (data.summary || "")}</div>
          </section>

          <section className="elegant-section">
            <h4>Experience</h4>
            {experience.map((ex,i) => (
              <div key={i} className="elegant-entry">
                <div className="elegant-entry-title">{ex.role || ex.position || ""} <span className="muted">— {ex.organization || ex.company || ""}</span></div>
                <div className="elegant-entry-date small">{range(ex)}</div>
                <div className="elegant-entry-desc">{Array.isArray(ex.responsibilities) ? ex.responsibilities.join(" ") : (ex.description || "")}</div>
              </div>
            ))}
          </section>
        </div>

        <aside className="elegant-right">
          <section className="elegant-section">
            <h4>Skills</h4>
            <ul className="elegant-skills">
              {skills.map((s,i) => <li key={i}>{typeof s === "string" ? s : (s && (s.name || s.title)) || ""}</li>)}
            </ul>
          </section>

          <section className="elegant-section">
            <h4>Projects</h4>
            {projects.map((pr,i) => {
              const name = pr.projectName || pr.title || pr.name || "";
              const desc = Array.isArray(pr.description) ? pr.description.join(" ") : (pr.description || "");
              const techs = Array.isArray(pr.technologies) ? pr.technologies : (Array.isArray(pr.tech) ? pr.tech : []);
              const links = Array.isArray(pr.links) ? pr.links : (pr.link ? [pr.link] : []);
              return (
                <div key={i} className="elegant-item">
                  <div className="elegant-item-title">{name}</div>
                  {links.length ? <div className="elegant-item-links">{links.map((l,idx) => <a key={idx} href={l} target="_blank" rel="noopener noreferrer">{l}</a>)}</div> : null}
                  <div className="elegant-item-desc">{desc}</div>
                  {techs.length ? <div className="elegant-item-sub small">Tech: {techs.join(", ")}</div> : null}
                </div>
              );
            })}
          </section>

          <section className="elegant-section">
            <h4>Education</h4>
            {education.map((ed,i) => (
              <div key={i} className="elegant-item">
                <div className="elegant-item-title">{ed.institution || ed.school || ""}</div>
                <div className="elegant-item-sub small">{ed.degree || ed.field || ""} • {range(ed)}</div>
              </div>
            ))}
          </section>

          <section className="elegant-section">
            <h4>Certifications</h4>
            {certifications.map((c,i) => {
              const title = c.title || c.name || "";
              const link = c.link || c.url || c.href;
              const issuer = c.issuer || c.authority || "";
              const year = c.year || c.date || "";
              return (
                <div key={i} className="elegant-item">
                  <div className="elegant-item-title">{link ? <a href={link} target="_blank" rel="noopener noreferrer">{title}</a> : title}</div>
                  {(issuer || year) ? <div className="elegant-item-sub small">{[issuer, year].filter(Boolean).join(" • ")}</div> : null}
                </div>
              );
            })}
          </section>
        </aside>
      </div>
    </div>
  );
}
