// frontend/src/utils/validate.js
// Centralized validation used by both ResumeForm and ResumePreview.


export default function validate(d = {}) {
  const e = {};
  const personal = d.personal || {};
  if (!personal.firstName || personal.firstName.trim() === '') {
    e['personal.firstName'] = 'First name is required';
  }
  if (!personal.lastName || personal.lastName.trim() === '') {
    e['personal.lastName'] = 'Last name is required';
  }
  if (!personal.email || personal.email.trim() === '') {
    e['personal.email'] = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email)) {
    e['personal.email'] = 'Invalid email';
  }

  if (d.summary && d.summary.length > 2000) {
    e['summary'] = 'Summary is too long';
  }

  const skills = Array.isArray(d.skills) ? d.skills : [];
  skills.forEach((s, i) => {
    if (!s || (typeof s === 'string' && s.trim() === '')) {
      e[`skills.${i}`] = 'Enter a skill or remove this field';
    }
  });

  const experience = Array.isArray(d.experience) ? d.experience : [];
  experience.forEach((it, i) => {
    if (!it) return;
    if (!it.role || (typeof it.role === 'string' && it.role.trim() === '')) {
      e[`experience.${i}.role`] = 'Role required';
    }
    if (!it.organization || (typeof it.organization === 'string' && it.organization.trim() === '')) {
      e[`experience.${i}.organization`] = 'Organization required';
    }
    if (it.startDate && typeof it.startDate === 'string' && it.startDate.length < 3) {
      e[`experience.${i}.startDate`] = 'Enter a valid start date';
    }
    if (it.endDate && typeof it.endDate === 'string' && it.endDate.length < 3) {
      e[`experience.${i}.endDate`] = 'Enter a valid end date';
    }
  });

  const projects = Array.isArray(d.projects) ? d.projects : [];
  projects.forEach((p, i) => {
    if (!p) return;
    if (!p.projectName || p.projectName.trim() === '') {
      e[`projects.${i}.projectName`] = 'Project name required';
    }
    const links = Array.isArray(p.links) ? p.links : [];
    links.forEach((ln, j) => {
      if (ln && ln.trim() !== '') {
        if (!/^https?:\/\/.+/.test(ln) && !/^mailto:.+/.test(ln)) {
          e[`projects.${i}.links.${j}`] = 'Use full URL (https://...) or mailto:';
        }
      }
    });
  });

  return e;
}
