Resume Builder
summary

MERN-style resume builder (React + Express). Frontend uses Vite. Backend contains a placeholder server. Client supports export and print.

requirements

Node.js (v16+)
npm
Windows PowerShell or similar

quickstart (windows)

cd resume-builder/backend
npm install
node server.js

open a second terminal:
cd resume-builder/frontend
npm install
npm run dev

application flow and status

Template selection: Display 2–3 templates. completed.
Template styles: Each template has distinct layout and styling. completed.
Selection action: Selecting a template opens the builder screen. completed.

Builder screen layout: Split screen. Left is form. Right is live preview. completed.
Live preview: Updates immediately on form change. completed.

Resume input schema: Captures candidate details, summary, skills, experience, projects, education, certifications. completed.
Validation: Basic validation for required fields. completed.

Template rendering: Resume renders with chosen template. completed.
Layout: Clean, single-page resume format. completed.

Download: Export and print option included. completed.
Output fidelity: Download matches the preview. completed.

State management: Single source of truth for resume data. completed.
Components: Reusable, modular components. completed.
Hardcoding: Templates do not contain hardcoded resume content. completed.
Code quality: Clean and readable code. completed.

notes(Extra features added base on other resume maker sites)

Upload parser extracts text from uploaded resumes. completed.
Backend MongoDB hooks exist but are commented. completed.
Parser returns contact fields, summary, skills, and sections for user review. completed.
Responsive: Basic responsive adjustments present. completed.

assumptions

The frontend is the primary focus. completed.
No user accounts or persistence required. completed.
User will review parsed data before saving or exporting. completed.

project files of interest

frontend/: Vite React app with components and templates. completed.
backend/: Minimal server placeholder. completed.
src/components/: Form, templates, preview, and parser. completed.
assets/ and styles/: Template CSS and shared styles. completed.

how each task from the assessment is implemented

Template selection UI: Simple gallery component. completed.
Template styling: Scoped CSS per template. completed.
Navigation: Router navigates to builder on select. completed.
Split layout: CSS flex/grid used for left form and right preview. completed.
Form design: Structured schema with sections and repeatable lists. completed.
Live data flow: Central state (context or top-level state) passed to preview. completed.
Parsing: Client-side text parser maps text to schema fields. completed.
Export: Print styles and client-side export produce downloadable document. completed.
Validation: Required fields flagged in the form. completed.

troubleshooting tips

If dev server fails, remove node_modules and reinstall. completed.
If worker or build issues occur, ensure Node version matches requirement. completed.
If export styling differs, check print media CSS rules. completed.

final notes

This README follows the assessment tasks and maps each task to implementation status.