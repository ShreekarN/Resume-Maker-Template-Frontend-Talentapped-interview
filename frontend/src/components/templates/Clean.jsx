// frontend/src/components/templates/Clean.jsx
import React from "react";



function choosePersonalLink(personal, ...keys) {
  for (const k of keys) {
    if (!personal) continue;
    if (personal[k]) return personal[k];
    if (personal.links && personal.links[k]) return personal.links[k];
  }
  return "";
}

function formatRange(item) {
  const s = item && (item.startDate || item.startYear || "");
  const e = item && (item.endDate || item.endYear || "");
  if (!s && !e) return "";
  const fmt = (d) => {
    if (!d) return "";
    if (d.match && d.match(/^\d{4}-\d{2}/)) {
      const dt = new Date(d);
      if (!isNaN(dt)) return dt.toLocaleString(undefined, { month: "short", year: "numeric" });
    }
    return d;
  };
  return `${fmt(s)}${s && e ? " — " : ""}${fmt(e) || (e === "" ? "Present" : "")}`.trim();
}

function joinText(t) {
  if (!t && t !== 0) return "";
  return Array.isArray(t) ? t.join(" ") : String(t);
}

export default function Clean({ data = {} }) {
  const p = data.personal || {};
  const linkedin = choosePersonalLink(p, "linkedin", "linkedIn");
  const github = choosePersonalLink(p, "github");
  const website = choosePersonalLink(p, "website", "site", "web");
  const portfolio = choosePersonalLink(p, "portfolio", "portfolioUrl");

  const experience = Array.isArray(data.experience) ? data.experience : [];
  const education = Array.isArray(data.education) ? data.education : [];
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const certifications = Array.isArray(data.certifications) ? data.certifications : [];

  return (
    <div className="resume-page clean-root">
      <header className="clean-header">
        <div className="clean-name">{`${p.firstName || ""} ${p.lastName || ""}`.trim()}</div>
        <div className="clean-title">{p.title || ""}</div>
        <div className="clean-contact">{[p.email, p.phone, p.location].filter(Boolean).join(" • ")}</div>
        <div className="clean-links">
          {[linkedin && <a key="li" href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>,
            github && <a key="gh" href={github} target="_blank" rel="noopener noreferrer">GitHub</a>,
            portfolio && <a key="pf" href={portfolio} target="_blank" rel="noopener noreferrer">Portfolio</a>,
            website && <a key="ws" href={website} target="_blank" rel="noopener noreferrer">Website</a>
          ].filter(Boolean).reduce((acc, el, i) => acc === null ? [el] : [...(Array.isArray(acc) ? acc : [acc]), " • ", el], null)}
        </div>
      </header>

      <main className="clean-body">
        <section className="clean-section">
          <h4>Experience</h4>
          {experience.map((ex, i) => (
            <div key={i} className="clean-entry">
              <div className="clean-entry-head">
                <div className="clean-entry-title">{ex.role || ex.position || ""}</div>
                <div className="clean-entry-sub">{ex.organization || ex.company || ""}</div>
                <div className="clean-entry-date">{formatRange(ex)}</div>
              </div>
              <div className="clean-entry-desc">{joinText(ex.responsibilities || ex.description)}</div>
            </div>
          ))}
        </section>

        <section className="clean-section">
          <h4>Projects</h4>
          {projects.map((pr, i) => {
            const name = pr.projectName || pr.title || pr.name || "";
            const desc = joinText(pr.description || pr.summary || "");
            const techs = Array.isArray(pr.technologies) ? pr.technologies : (Array.isArray(pr.tech) ? pr.tech : []);
            const links = Array.isArray(pr.links) ? pr.links : (pr.link ? [pr.link] : []);
            return (
              <div key={i} className="clean-entry">
                <div className="clean-entry-title">{name}</div>
                {links.length ? <div className="clean-entry-links">{links.map((l, idx) => <a key={idx} href={l} target="_blank" rel="noopener noreferrer">{l}</a>)}</div> : null}
                <div className="clean-entry-desc">{desc}</div>
                {techs.length ? <div className="clean-entry-sub small">Tech: {techs.join(", ")}</div> : null}
              </div>
            );
          })}
        </section>

        <aside className="clean-aside">
          <div className="clean-section">
            <h4>Education</h4>
            {education.map((ed, i) => (
              <div key={i} className="clean-item">
                <div className="clean-item-title">{ed.institution || ed.school || ""}</div>
                <div className="clean-item-sub">{ed.degree || ed.field || ""} • {formatRange(ed)}</div>
              </div>
            ))}
          </div>

          <div className="clean-section">
            <h4>Certifications</h4>
            {certifications.map((c, i) => {
              const title = c.title || c.name || "";
              const link = c.link || c.url || c.href;
              return <div key={i} className="clean-item">{link ? <a href={link} target="_blank" rel="noopener noreferrer">{title}</a> : title}</div>;
            })}
          </div>

          <div className="clean-section">
            <h4>Skills</h4>
            <div className="clean-skills">{skills.map((s,i) => <div key={i} className="clean-skill">{typeof s === "string" ? s : (s && (s.name || s.title)) || ""}</div>)}</div>
          </div>
        </aside>
      </main>
    </div>
  );
}
