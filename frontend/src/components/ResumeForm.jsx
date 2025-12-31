// frontend/src/components/ResumeForm.jsx


import React, { useContext, useState, useEffect } from 'react';
import ResumeContext from '../context/ResumeContext';
import validate from '../utils/validate'; // centralized validation
import PdfImporter from './PdfImporter';

const cloneDeep = (obj) => {
  try { return JSON.parse(JSON.stringify(obj || {})); } catch (e) { return {}; }
};

function setAtPath(obj, path, value) {
  const out = cloneDeep(obj || {});
  if (!path) {
    return value === undefined ? out : value;
  }
  const keys = path.split('.');
  let cur = out;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (cur[k] === undefined || cur[k] === null) cur[k] = {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return out;
}

function getAtPath(obj, path, fallback = '') {
  if (!obj) return fallback;
  if (!path) return obj;
  const keys = path.split('.');
  let cur = obj;
  for (let k of keys) {
    if (cur === undefined || cur === null) return fallback;
    cur = cur[k];
  }
  return cur === undefined ? fallback : cur;
}

function ResumeForm() {
  const { data, setResumeData, replaceResumeData, resetResumeData } = useContext(ResumeContext);

  const [localData, setLocalData] = useState(cloneDeep(data || {}));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalData(cloneDeep(data || {}));
    setErrors({});
    setTouched({});
  }, [data]);

  const updateContext = (next) => {
    if (typeof setResumeData === 'function') {
      setResumeData(next);
    } else if (typeof replaceResumeData === 'function') {
      replaceResumeData(next);
    }
  };

  const patch = (path, value) => {
    const updated = setAtPath(localData, path, value);
    setLocalData(updated);
    updateContext(updated);
  };

  // Validate on every change
  useEffect(() => {
    setErrors(validate(localData));
  }, [localData]);

  const ensureArray = (arr) => (Array.isArray(arr) ? arr : []);

  // PDF parsed merge handler (robust)
  const handleParsed = (parsed) => {
    console.log("[ResumeForm] handleParsed called:", parsed);
    if (!parsed || typeof parsed !== 'object') return;
    try {
      // build merged object from current context `data` (safe access)
      const base = cloneDeep(data || {});
      // merge personal fields conservatively
      if (parsed.personal) {
        base.personal = { ...(base.personal || {}), ...(parsed.personal || {}) };
        if (parsed.personal.fullName && !(base.personal.firstName || base.personal.lastName)) {
          const names = (parsed.personal.fullName || '').trim().split(/\s+/);
          if (names.length === 1) base.personal.firstName = names[0];
          else {
            base.personal.firstName = names[0];
            base.personal.lastName = names.slice(1).join(' ');
          }
        }
      }
      // summary
      if (parsed.summary && !base.summary) base.summary = parsed.summary;
      // skills (merge unique)
      if (Array.isArray(parsed.skills)) {
        base.skills = Array.from(new Set([...(base.skills || []).filter(Boolean), ...parsed.skills.filter(Boolean)]));
      }
      // arrays: append parsed values
      const appendIfArray = (key) => {
        if (!Array.isArray(parsed[key])) return;
        base[key] = base[key] || [];
        for (const it of parsed[key]) {
          try {
            base[key].push(it);
          } catch {}
        }
      };
      appendIfArray('experience');
      appendIfArray('projects');
      appendIfArray('education');
      appendIfArray('certifications');

      // Now update context with a *value* (avoid passing a function if setResumeData expects value)
      if (typeof setResumeData === 'function') {
        try {
          setResumeData(base);
        } catch (e) {
          // if setResumeData expects a setter function , fallback to replaceResumeData
          if (typeof replaceResumeData === 'function') replaceResumeData(base);
        }
      } else if (typeof replaceResumeData === 'function') {
        replaceResumeData(base);
      }

      // Also update local state for immediate reflection
      setLocalData(base);
      console.log("[ResumeForm] merged parsed data and updated context/localData");
    } catch (err) {
      console.error("[ResumeForm] handleParsed merge error:", err);
    }
  };

  // Skills helpers
  const addSkill = (value = '') => {
    const s = ensureArray(localData.skills);
    const next = [...s, value];
    patch('skills', next);
  };
  const updateSkill = (index, value) => {
    const s = ensureArray(localData.skills).slice();
    s[index] = value;
    patch('skills', s);
  };
  const removeSkill = (index) => {
    const s = ensureArray(localData.skills).slice();
    s.splice(index, 1);
    patch('skills', s);
  };

  // Experience helpers
  const addExperience = () => {
    const list = ensureArray(localData.experience).slice();
    list.push({
      role: '',
      organization: '',
      location: '',
      startDate: '',
      endDate: '',
      responsibilities: ['']
    });
    patch('experience', list);
  };
  const updateExperienceField = (idx, field, value) => {
    const list = ensureArray(localData.experience).slice();
    list[idx] = list[idx] || {};
    list[idx][field] = value;
    patch('experience', list);
  };
  const removeExperience = (idx) => {
    const list = ensureArray(localData.experience).slice();
    list.splice(idx, 1);
    patch('experience', list);
  };

  // Projects helpers (defensive guards)
  const addProject = () => {
    const list = ensureArray(localData.projects).slice();
    list.push({ projectName: '', description: [''], technologies: [''], links: [''] });
    patch('projects', list);
  };
  const updateProjectField = (idx, field, value) => {
    const list = ensureArray(localData.projects).slice();
    list[idx] = list[idx] || {};
    list[idx][field] = value;
    patch('projects', list);
  };
  const addProjectLink = (pidx, value = '') => {
    const list = ensureArray(localData.projects).slice();
    list[pidx] = list[pidx] || { links: [] };
    const links = ensureArray(list[pidx].links).slice();
    links.push(value);
    list[pidx].links = links;
    patch('projects', list);
  };
  const updateProjectLink = (pidx, lidx, value) => {
    const list = ensureArray(localData.projects).slice();
    if (!list[pidx]) return; // guard
    const links = ensureArray(list[pidx].links).slice();
    links[lidx] = value;
    list[pidx].links = links;
    patch('projects', list);
  };
  const removeProjectLink = (pidx, lidx) => {
    const list = ensureArray(localData.projects).slice();
    if (!list[pidx]) return; // guard
    const links = ensureArray(list[pidx].links).slice();
    links.splice(lidx, 1);
    list[pidx].links = links;
    patch('projects', list);
  };

  // Education helpers
  const addEducation = () => {
    const list = ensureArray(localData.education).slice();
    list.push({ institution: '', degree: '', startYear: '', endYear: '' });
    patch('education', list);
  };
  const updateEducationField = (idx, field, value) => {
    const list = ensureArray(localData.education).slice();
    list[idx] = list[idx] || {};
    list[idx][field] = value;
    patch('education', list);
  };
  const removeEducation = (idx) => {
    const list = ensureArray(localData.education).slice();
    list.splice(idx, 1);
    patch('education', list);
  };

  // Certifications helpers
  const addCert = () => {
    const list = ensureArray(localData.certifications).slice();
    list.push({ name: '', link: '' });
    patch('certifications', list);
  };
  const updateCertField = (idx, field, value) => {
    const list = ensureArray(localData.certifications).slice();
    list[idx] = list[idx] || {};
    list[idx][field] = value;
    patch('certifications', list);
  };
  const removeCert = (idx) => {
    const list = ensureArray(localData.certifications).slice();
    list.splice(idx, 1);
    patch('certifications', list);
  };

  // Clean data before validate/save (remove empty strings, trim, etc.)
  const cleanForSave = (raw) => {
    const out = cloneDeep(raw || {});
    // skills -> remove empty/whitespace
    out.skills = ensureArray(out.skills).map(s => (typeof s === 'string' ? s.trim() : s)).filter(Boolean);
    // projects: clean links, technologies, description arrays
    out.projects = ensureArray(out.projects).map(p => {
      const pp = { ...(p || {}) };
      pp.projectName = (pp.projectName || '').trim();
      pp.description = ensureArray(pp.description).map(d => d.trim()).filter(Boolean);
      pp.technologies = ensureArray(pp.technologies).map(t => (typeof t === 'string' ? t.trim() : t)).filter(Boolean);
      pp.links = ensureArray(pp.links).map(l => (typeof l === 'string' ? l.trim() : l)).filter(Boolean);
      return pp;
    }).filter(p => p.projectName || (p.description && p.description.length));
    // experience: ensure responsibilities arrays
    out.experience = ensureArray(out.experience).map(ex => {
      const e = { ...(ex || {}) };
      e.role = (e.role || '').trim();
      e.organization = (e.organization || '').trim();
      e.responsibilities = ensureArray(e.responsibilities).map(r => (typeof r === 'string' ? r.trim() : r)).filter(Boolean);
      return e;
    });
    // education: trim strings
    out.education = ensureArray(out.education).map(ed => {
      const ee = { ...(ed || {}) };
      ee.institution = (ee.institution || '').trim();
      ee.degree = (ee.degree || '').trim();
      ee.startYear = ee.startYear ? String(ee.startYear).trim() : '';
      ee.endYear = ee.endYear ? String(ee.endYear).trim() : '';
      return ee;
    });
    // certifications
    out.certifications = ensureArray(out.certifications).map(c => ({ name: (c.name || '').trim(), link: (c.link || '').trim() })).filter(c => c.name);
    // personal: trim basic fields
    out.personal = out.personal || {};
    out.personal.firstName = (out.personal.firstName || '').trim();
    out.personal.lastName = (out.personal.lastName || '').trim();
    out.personal.email = (out.personal.email || '').trim();
    out.personal.phone = (out.personal.phone || '').trim();
    out.personal.location = (out.personal.location || '').trim();
    out.personal.linkedin = (out.personal.linkedin || '').trim();
    out.personal.github = (out.personal.github || '').trim();
    out.personal.portfolio = (out.personal.portfolio || '').trim();
    out.personal.website = (out.personal.website || '').trim();
    out.summary = (out.summary || '').trim();
    return out;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const cleaned = cleanForSave(localData);
      const e = validate(cleaned);
      setErrors(e);
      if (Object.keys(e).length) {
        const t = {};
        Object.keys(e).forEach((k) => (t[k] = true));
        setTouched((prev) => ({ ...prev, ...t }));
        alert('Fix validation errors first (see red messages).');
        return;
      }
      if (typeof replaceResumeData === 'function') {
        replaceResumeData(cleaned);
      } else if (typeof setResumeData === 'function') {
        setResumeData(cleaned);
      }
      alert('Saved.');
    } catch (err) {
      console.error(err);
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const Err = ({ field }) => {
    const msg = errors[field];
    if (!msg || !touched[field]) return null;
    return (
      <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
        {msg}
      </div>
    );
  };

  const markTouched = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
  };

  // Render sections 
  const renderPersonal = () => {
    const p = localData.personal || {};
    return (
      <div style={{ marginBottom: 12 }}>
        {}
        <div style={{ marginBottom: 8 }}>
          <PdfImporter onParsed={handleParsed} />
        </div>

        <h3>Candidate details</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <input
              className="input"
              placeholder="First name"
              value={p.firstName || ''}
              onChange={(e) => patch('personal.firstName', e.target.value)}
              onBlur={() => markTouched('personal.firstName')}
            />
            <Err field="personal.firstName" />
          </div>
          <div style={{ flex: 1 }}>
            <input
              className="input"
              placeholder="Last name"
              value={p.lastName || ''}
              onChange={(e) => patch('personal.lastName', e.target.value)}
              onBlur={() => markTouched('personal.lastName')}
            />
            <Err field="personal.lastName" />
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <input
            className="input"
            placeholder="Title (e.g. Frontend Developer)"
            value={p.title || ''}
            onChange={(e) => patch('personal.title', e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <div style={{ flex: 1 }}>
            <input
              className="input"
              placeholder="Email"
              value={p.email || ''}
              onChange={(e) => patch('personal.email', e.target.value)}
              onBlur={() => markTouched('personal.email')}
            />
            <Err field="personal.email" />
          </div>
          <div style={{ flex: 1 }}>
            <input
              className="input"
              placeholder="Phone"
              value={p.phone || ''}
              onChange={(e) => patch('personal.phone', e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <input
            className="input"
            placeholder="Location"
            value={p.location || ''}
            onChange={(e) => patch('personal.location', e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            className="input"
            placeholder="LinkedIn (full URL)"
            value={p.linkedin || ''}
            onChange={(e) => patch('personal.linkedin', e.target.value)}
          />
          <input
            className="input"
            placeholder="GitHub (full URL)"
            value={p.github || ''}
            onChange={(e) => patch('personal.github', e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            className="input"
            placeholder="Portfolio (URL)"
            value={p.portfolio || ''}
            onChange={(e) => patch('personal.portfolio', e.target.value)}
          />
          <input
            className="input"
            placeholder="Website (URL)"
            value={p.website || ''}
            onChange={(e) => patch('personal.website', e.target.value)}
          />
        </div>
      </div>
    );
  };

  const renderSummary = () => (
    <div style={{ marginBottom: 12 }}>
      <h3>Professional summary</h3>
      <textarea
        className="input"
        placeholder="Brief summary..."
        value={localData.summary || ''}
        onChange={(e) => patch('summary', e.target.value)}
        rows={4}
      />
      <Err field="summary" />
    </div>
  );

  const renderSkills = () => {
    const skills = ensureArray(localData.skills);
    return (
      <div style={{ marginBottom: 12 }}>
        <h3>Skills</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {skills.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                className="input"
                placeholder={`Skill ${i + 1}`}
                value={s || ''}
                onChange={(e) => updateSkill(i, e.target.value)}
                onBlur={() => markTouched(`skills.${i}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && (e.target.value === '' || e.target.value === undefined)) {
                    e.preventDefault();
                    removeSkill(i);
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill('');
                  }
                }}
                style={{ flex: 1 }}
              />
              <button type="button" className="button" onClick={() => removeSkill(i)}>Remove</button>
              <Err field={`skills.${i}`} />
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="button" onClick={() => addSkill('')}>Add skill</button>
            <div style={{ alignSelf: 'center', fontSize: 12, color: '#666' }}>Press Enter to add or Backspace on empty to remove</div>
          </div>
        </div>
      </div>
    );
  };

  const renderExperience = () => {
    const list = ensureArray(localData.experience);
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Experience</h3>
          <button type="button" className="button" onClick={addExperience}>Add</button>
        </div>

        {list.map((it, idx) => (
          <div key={idx} style={{ border: '1px solid #eee', padding: 8, marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <input
                  className="input"
                  placeholder="Role (e.g. Software Engineer)"
                  value={it.role || ''}
                  onChange={(e) => updateExperienceField(idx, 'role', e.target.value)}
                  onBlur={() => markTouched(`experience.${idx}.role`)}
                />
                <Err field={`experience.${idx}.role`} />
              </div>

              <div style={{ flex: 1 }}>
                <input
                  className="input"
                  placeholder="Organization"
                  value={it.organization || ''}
                  onChange={(e) => updateExperienceField(idx, 'organization', e.target.value)}
                  onBlur={() => markTouched(`experience.${idx}.organization`)}
                />
                <Err field={`experience.${idx}.organization`} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                className="input"
                placeholder="Location"
                value={it.location || ''}
                onChange={(e) => updateExperienceField(idx, 'location', e.target.value)}
                style={{ flex: 1 }}
              />

              <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                <input
                  className="input"
                  type="month"
                  placeholder="Start date"
                  value={it.startDate || ''}
                  onChange={(e) => updateExperienceField(idx, 'startDate', e.target.value)}
                  onBlur={() => markTouched(`experience.${idx}.startDate`)}
                />
                <input
                  className="input"
                  type="month"
                  placeholder="End date"
                  value={it.endDate || ''}
                  onChange={(e) => updateExperienceField(idx, 'endDate', e.target.value)}
                  onBlur={() => markTouched(`experience.${idx}.endDate`)}
                />
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <label style={{ fontSize: 13, color: '#444' }}>Responsibilities (one per line)</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Responsibilities..."
                value={Array.isArray(it.responsibilities) ? it.responsibilities.join('\n') : (it.responsibilities || '')}
                onChange={(e) => {
                  const arr = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
                  updateExperienceField(idx, 'responsibilities', arr);
                }}
              />
            </div>

            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button type="button" className="button" onClick={() => removeExperience(idx)}>Remove</button>
            </div>
          </div>
        ))} 
      </div>
    );
  };

  const renderProjects = () => {
    const list = ensureArray(localData.projects);
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Projects</h3>
          <button className="button" type="button" onClick={addProject}>Add</button>
        </div>

        {list.map((p, idx) => (
          <div key={idx} style={{ border: '1px solid #eee', padding: 8, marginBottom: 8 }}>
            <input
              className="input"
              placeholder="Project name"
              value={p.projectName || ''}
              onChange={(e) => updateProjectField(idx, 'projectName', e.target.value)}
              onBlur={() => markTouched(`projects.${idx}.projectName`)}
            />
            <Err field={`projects.${idx}.projectName`} />

            <div style={{ marginTop: 8 }}>
              <label style={{ fontSize: 13 }}>Description (one per line)</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Short description..."
                value={Array.isArray(p.description) ? p.description.join('\n') : (p.description || '')}
                onChange={(e) => {
                  const arr = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
                  updateProjectField(idx, 'description', arr);
                }}
              />
            </div>

            <div style={{ marginTop: 8 }}>
              <label style={{ fontSize: 13 }}>Technologies (comma separated)</label>
              <input
                className="input"
                placeholder="React, Node, Express"
                value={Array.isArray(p.technologies) ? p.technologies.join(', ') : (p.technologies || '')}
                onChange={(e) => {
                  const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                  updateProjectField(idx, 'technologies', arr);
                }}
              />
            </div>

            <div style={{ marginTop: 8 }}>
              <label style={{ fontSize: 13 }}>Links</label>
              {ensureArray(p.links).map((ln, j) => (
                <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
                  <input
                    className="input"
                    placeholder="https://..."
                    value={ln || ''}
                    onChange={(e) => updateProjectLink(idx, j, e.target.value)}
                    onBlur={() => markTouched(`projects.${idx}.links.${j}`)}
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="button" onClick={() => removeProjectLink(idx, j)}>Remove</button>
                  <Err field={`projects.${idx}.links.${j}`} />
                </div>
              ))}
              <div style={{ marginTop: 6 }}>
                <button type="button" className="button" onClick={() => addProjectLink(idx, '')}>Add link</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEducation = () => {
    const list = ensureArray(localData.education);
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Education</h3>
          <button className="button" type="button" onClick={addEducation}>Add</button>
        </div>

        {list.map((ed, i) => (
          <div key={i} style={{ border: '1px solid #eee', padding: 8, marginBottom: 8 }}>
            <input
              className="input"
              placeholder="Institution"
              value={ed.institution || ''}
              onChange={(e) => {
                const arr = ensureArray(localData.education);
                arr[i] = arr[i] || {};
                arr[i].institution = e.target.value;
                patch('education', arr);
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                className="input"
                placeholder="Degree"
                value={ed.degree || ''}
                onChange={(e) => {
                  const arr = ensureArray(localData.education);
                  arr[i] = arr[i] || {};
                  arr[i].degree = e.target.value;
                  patch('education', arr);
                }}
              />
              <input
                className="input"
                type="month"
                placeholder="Start"
                value={ed.startYear ? `${ed.startYear}-01` : ''}
                onChange={(e) => {
                  const arr = ensureArray(localData.education);
                  arr[i] = arr[i] || {};
                  const val = e.target.value;
                  arr[i].startYear = val ? String(val).split('-')[0] : '';
                  patch('education', arr);
                }}
              />
              <input
                className="input"
                type="month"
                placeholder="End"
                value={ed.endYear ? `${ed.endYear}-01` : ''}
                onChange={(e) => {
                  const arr = ensureArray(localData.education);
                  arr[i] = arr[i] || {};
                  const val = e.target.value;
                  arr[i].endYear = val ? String(val).split('-')[0] : '';
                  patch('education', arr);
                }}
              />
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button type="button" className="button" onClick={() => removeEducation(i)}>Remove</button>
            </div>
          </div>
        ))} 
      </div>
    );
  };

  const renderCerts = () => {
    const list = ensureArray(localData.certifications);
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Certifications</h3>
          <button className="button" type="button" onClick={addCert}>Add</button>
        </div>

        {list.map((c, i) => (
          <div key={i} style={{ border: '1px solid #eee', padding: 8, marginBottom: 8 }}>
            <input
              className="input"
              placeholder="Certificate title"
              value={c.name || ''}
              onChange={(e) => updateCertField(i, 'name', e.target.value)}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                className="input"
                placeholder="Link (optional)"
                value={c.link || ''}
                onChange={(e) => updateCertField(i, 'link', e.target.value)}
              />
              <button type="button" className="button" onClick={() => removeCert(i)}>Remove</button>
            </div>
          </div>
        ))} 
      </div>
    );
  };

  return (
    <div style={{ padding: 12 }}>
      {renderPersonal()}

      {renderSummary()}

      {renderSkills()}

      {renderExperience()}

      {renderProjects()}

      {renderEducation()}

      {renderCerts()}

      <p />
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="button" type="button" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          className="button"
          type="button"
          onClick={() => {
            if (typeof resetResumeData === 'function') {
              resetResumeData();
            } else {
              const blank = {
                personal: {},
                summary: '',
                skills: [],
                experience: [],
                projects: [],
                education: [],
                certifications: []
              };
              patch('', blank);
              if (typeof replaceResumeData === 'function') replaceResumeData(blank);
            }
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default ResumeForm;
