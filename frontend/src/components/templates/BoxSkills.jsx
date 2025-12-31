// frontend/src/components/templates/BoxSkills.jsx
import React from "react";



function safeGetLink(personal, ...names) {
  for (const n of names) {
    if (!personal) continue;
    if (personal[n]) return personal[n];
    // also accept nested object 'links'
    if (personal.links && personal.links[n]) return personal.links[n];
  }
  return "";
}

function fmtDateRange(entry) {
  if (!entry) return "";
  const s = entry.startDate || entry.startYear || "";
  const e = entry.endDate || entry.endYear || "";
  const pretty = (d) => {
    if (!d) return "";
    // if ISO like YYYY-MM or YYYY-MM-DD, return MMM YYYY or YYYY if only year
    if (typeof d === "string") {
      const m = d.match(/^(\d{4})-(\d{2})/);
      if (m) {
        const ym = new Date(d);
        if (!isNaN(ym)) {
          return ym.toLocaleString(undefined, { month: "short", year: "numeric" });
        }
      }
      const y = d.match(/^(\d{4})$/);
      if (y) return y[1];
      return d; // fallback raw
    }
    return String(d);
  };

  const start = pretty(s);
  const end = e ? (pretty(e) === "" ? "" : pretty(e)) : "Present";
  return start || end ? (start + (start && end ? " — " : "") + (end || "")) : "";
}

function renderTextArray(val) {
  if (!val && val !== 0) return "";
  if (Array.isArray(val)) return val.join(" ");
  return String(val);
}

function BoxSkills({ data = {} }) {
  const p = data.personal || {};

  const linkedin = safeGetLink(p, "linkedin", "linkedIn");
  const github = safeGetLink(p, "github");
  const portfolio = safeGetLink(p, "portfolio", "portfolioUrl", "portfolioLink");
  const website = safeGetLink(p, "website", "site", "web");

  const skills = Array.isArray(data.skills) ? data.skills : [];
  const education = Array.isArray(data.education) ? data.education : [];
  const experience = Array.isArray(data.experience) ? data.experience : [];
  const certifications = Array.isArray(data.certifications) ? data.certifications : [];
  const projects = Array.isArray(data.projects) ? data.projects : [];

  return (
    <div className="resume-page boxed-root">
      <div className="boxed-header">
        <div className="boxed-name">{`${p.firstName || ""} ${p.lastName || ""}`.trim()}</div>
        <div className="boxed-title">{p.title || ""}</div>

        <div className="boxed-contact">
          {p.email ? <span>{p.email}</span> : null}
          {p.email && (p.phone || p.location) ? " • " : null}
          {p.phone ? <span>{p.phone}</span> : null}
          {p.phone && p.location ? " • " : null}
          {p.location ? <span>{p.location}</span> : null}
        </div>

        <div className="boxed-links">
          {linkedin ? (
            <a href={linkedin} target="_blank" rel="noopener noreferrer" className="boxed-link">LinkedIn</a>
          ) : null}
          {github ? (
            <>
              {linkedin ? " • " : null}
              <a href={github} target="_blank" rel="noopener noreferrer" className="boxed-link">GitHub</a>
            </>
          ) : null}
          {portfolio ? (
            <>
              {(linkedin || github) ? " • " : null}
              <a href={portfolio} target="_blank" rel="noopener noreferrer" className="boxed-link">Portfolio</a>
            </>
          ) : null}
          {website ? (
            <>
              {(linkedin || github || portfolio) ? " • " : null}
              <a href={website} target="_blank" rel="noopener noreferrer" className="boxed-link">Website</a>
            </>
          ) : null}
        </div>
      </div>

      <div className="boxed-body">
        <aside className="boxed-side">
          <section className="boxed-section">
            <h3 className="boxed-section-title">Skills</h3>
            <div className="boxed-skills">
              {skills.map((s, i) => {
                const label = typeof s === "string" ? s : (s && (s.name || s.title)) || "";
                return <div key={i} className="boxed-skill">{label}</div>;
              })}
            </div>
          </section>

          <section className="boxed-section">
            <h3 className="boxed-section-title">Education</h3>
            {(education || []).map((ed, i) => (
              <div key={i} className="boxed-item">
                <div className="boxed-entry-title">{ed.institution || ed.school || ""}</div>
                <div className="boxed-entry-sub">{ed.degree || ed.course || ""}</div>
                <div className="boxed-entry-sub small">{fmtDateRange(ed)}</div>
              </div>
            ))}
          </section>

          <section className="boxed-section">
            <h3 className="boxed-section-title">Certifications</h3>
            {(certifications || []).map((c, i) => {
              const title = (c && (c.title || c.name || c.certification || "")) || "";
              const issuer = c && (c.issuer || c.authority || "");
              const year = c && (c.year || c.date || "");
              const link = c && (c.link || c.url || c.href);
              return (
                <div key={i} className="boxed-item">
                  <div className="boxed-entry-title">
                    {link ? <a href={link} target="_blank" rel="noopener noreferrer">{title}</a> : title}
                  </div>
                  {(issuer || year) ? <div className="boxed-entry-sub small">{[issuer, year].filter(Boolean).join(" • ")}</div> : null}
                </div>
              );
            })}
          </section>
        </aside>

        <main className="boxed-main">
          <section className="boxed-section">
            <h3 className="boxed-section-title">Experience</h3>
            {(experience || []).map((ex, i) => (
              <div key={i} className="boxed-item">
                <div className="boxed-entry-title">{ex.role || ex.position || ""} <span className="muted">— {ex.organization || ex.company || ""}</span></div>
                <div className="boxed-entry-sub small">{fmtDateRange(ex)}</div>
                <div className="boxed-entry-desc">{renderTextArray(ex.responsibilities || ex.description)}</div>
              </div>
            ))}
          </section>

          <section className="boxed-section">
            <h3 className="boxed-section-title">Projects</h3>
            {(projects || []).map((pr, i) => {
              const name = pr.projectName || pr.title || pr.name || "";
              const desc = renderTextArray(pr.description || pr.summary || "");
              const techs = Array.isArray(pr.technologies) ? pr.technologies : (Array.isArray(pr.tech) ? pr.tech : []);
              const links = Array.isArray(pr.links) ? pr.links : (pr.link ? [pr.link] : []);
              return (
                <div key={i} className="boxed-item">
                  <div className="boxed-entry-title">
                    {name}
                    {links.length ? (
                      <span className="muted"> {" • "} {links.map((l, idx) => <a key={idx} href={l} target="_blank" rel="noopener noreferrer">{l}</a>)}</span>
                    ) : null}
                  </div>
                  <div className="boxed-entry-desc">{desc}</div>
                  {techs.length ? <div className="boxed-entry-sub small">Technologies: {techs.join(", ")}</div> : null}
                </div>
              );
            })}
          </section>
        </main>
      </div>
    </div>
  );
}

export default BoxSkills;
