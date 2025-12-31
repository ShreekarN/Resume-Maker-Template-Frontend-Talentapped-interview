import React, { createContext, useCallback, useEffect, useState } from "react";

/* placeholder */
const placeholder = {
  personal: {
    firstName: "Lorem",
    lastName: "Ipsum",
    fullName: "Lorem Ipsum",
    title: "Undergraduate Student",
    email: "lorem.ipsum@example.com",
    phone: "+91 99999 99999",
    location: "City, Country",
    linkedin: "",
    github: "",
    portfolio: "",
    website: ""
  },
  summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Brief summary here.",
  skills: ["Communication", "Teamwork", "React", "Node.js"],
  experience: [
    {
      role: "Intern",
      organization: "Company X",
      location: "City",
      startDate: "2024-01",
      endDate: "2024-06",
      responsibilities: ["Worked on feature A", "Improved B"]
    }
  ],
  projects: [
    {
      projectName: "Demo Project",
      description: ["Built demo app"],
      technologies: ["React", "Express"],
      links: [""]
    }
  ],
  education: [
    {
      degree: "B.Tech",
      institution: "University",
      fieldOfStudy: "IT",
      startDate: "2021-06",
      endDate: "2025-05",
      cgpa: ""
    }
  ],
  certifications: [{ title: "Cert Name", issuer: "", year: "" }]
};

/* context */
const ResumeContext = createContext(null);

/* util check */
function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}

/* deep merge */
function deepMerge(target, source) {
  if (!isObject(target) || !isObject(source)) return source;
  const out = { ...target };
  Object.keys(source).forEach((key) => {
    const s = source[key];
    const t = target[key];
    if (isObject(s)) out[key] = deepMerge(isObject(t) ? t : {}, s);
    else out[key] = s;
  });
  return out;
}

/* Standardize data structure */
function normalizeResume(raw = {}) {
  const data = JSON.parse(JSON.stringify(raw || {}));

  data.personal = data.personal || {};
  data.personal.links = data.personal.links || {};

  const linkKeys = [
    ["linkedin", "linkedIn"],
    ["github"],
    ["portfolio", "portfolioUrl", "portfolioLink"],
    ["website", "site", "web"]
  ];

  linkKeys.forEach((aliases) => {
    for (const k of aliases) {
      if (data.personal[k]) {
        const primary = aliases[0];
        data.personal[primary] ||= data.personal[k];
        data.personal.links[primary] ||= data.personal[k];
        break;
      }
      if (data.personal.links?.[aliases[0]]) {
        data.personal[aliases[0]] ||= data.personal.links[aliases[0]];
        break;
      }
    }
  });

  if (!Array.isArray(data.skills)) {
    if (typeof data.skills === "string") {
      data.skills = data.skills.split(",").map(s => s.trim()).filter(Boolean);
    } else {
      data.skills = [];
    }
  }

  ["education", "experience"].forEach((section) => {
    data[section] = Array.isArray(data[section]) ? data[section] : [];
    data[section] = data[section].map((item) => {
      const out = { ...item };
      if (!out.startDate && out.startYear) out.startDate = String(out.startYear);
      if (!out.endDate && out.endYear) out.endDate = String(out.endYear);
      return out;
    });
  });

  data.projects = Array.isArray(data.projects) ? data.projects : [];
  data.projects = data.projects.map((p) => {
    const out = { ...p };
    out.title = out.title || out.projectName || out.name || "";
    out.projectName ||= out.title;

    if (!Array.isArray(out.links)) {
      out.links = out.link ? [out.link] : [];
    }

    if (!Array.isArray(out.technologies)) {
      if (Array.isArray(out.tech)) out.technologies = out.tech;
      else if (typeof out.technologies === "string") {
        out.technologies = out.technologies.split(",").map(t => t.trim()).filter(Boolean);
      } else out.technologies = [];
    }

    return out;
  });

  data.certifications = Array.isArray(data.certifications) ? data.certifications : [];
  data.certifications = data.certifications.map((c) => ({
    ...c,
    title: c.title || c.name || c.certification || "",
    link: c.link || c.url || c.href || "",
    issuer: c.issuer || c.authority || "",
    year: c.year || c.date || ""
  }));

  return data;
}

/* provider */
export function ResumeProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem("resume-data");
      if (!raw) return normalizeResume(placeholder);
      const parsed = JSON.parse(raw);
      return normalizeResume(deepMerge(placeholder, parsed));
    } catch {
      return normalizeResume(placeholder);
    }
  });

  const setResumeData = useCallback((patchOrUpdater) => {
    if (typeof patchOrUpdater === "function") {
      setData((prev) => {
        const result = patchOrUpdater(prev);
        if (result === undefined) return prev;
        return normalizeResume(
          isObject(result) ? deepMerge(prev, result) : result
        );
      });
    } else {
      setData((prev) => normalizeResume(deepMerge(prev, patchOrUpdater || {})));
    }
  }, []);

  const replaceResumeData = useCallback((newDataOrUpdater) => {
    if (typeof newDataOrUpdater === "function") {
      setData((prev) => {
        const res = newDataOrUpdater(prev);
        return res === undefined
          ? prev
          : normalizeResume(deepMerge(placeholder, res));
      });
    } else {
      setData(
        newDataOrUpdater
          ? normalizeResume(deepMerge(placeholder, newDataOrUpdater))
          : normalizeResume(placeholder)
      );
    }
  }, []);

  const resetResumeData = useCallback(() => {
    setData(normalizeResume(placeholder));
  }, []);

  const addItem = useCallback((section, item = null) => {
    setData((prev) => {
      if (!Array.isArray(prev[section])) return prev;

      const defaults = {
        skills: "",
        experience: {
          role: "",
          organization: "",
          location: "",
          startDate: "",
          endDate: "",
          responsibilities: [""]
        },
        projects: { projectName: "", description: [""], technologies: [""], links: [""] },
        education: { degree: "", institution: "", fieldOfStudy: "", startYear: "", endYear: "", cgpa: "" },
        certifications: { name: "", link: "" }
      };

      return normalizeResume({
        ...prev,
        [section]: [...prev[section], item ?? defaults[section] ?? {}]
      });
    });
  }, []);

  const updateItem = useCallback((section, index, patchOrValue) => {
    setData((prev) => {
      if (!Array.isArray(prev[section])) return prev;
      if (index < 0 || index >= prev[section].length) return prev;

      const arr = [...prev[section]];
      const cur = arr[index];

      if (typeof patchOrValue === "function") arr[index] = patchOrValue(cur);
      else if (isObject(cur) && isObject(patchOrValue)) arr[index] = deepMerge(cur, patchOrValue);
      else arr[index] = patchOrValue;

      return normalizeResume({ ...prev, [section]: arr });
    });
  }, []);

  const removeItem = useCallback((section, index) => {
    setData((prev) => {
      if (!Array.isArray(prev[section])) return prev;
      if (index < 0 || index >= prev[section].length) return prev;

      const arr = prev[section].slice();
      arr.splice(index, 1);
      return normalizeResume({ ...prev, [section]: arr });
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("resume-data", JSON.stringify(data));
    } catch {}
  }, [data]);

  return (
    <ResumeContext.Provider
      value={{
        data,
        setResumeData,
        replaceResumeData,
        resetResumeData,
        addItem,
        updateItem,
        removeItem
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export default ResumeContext;
export { ResumeContext };
