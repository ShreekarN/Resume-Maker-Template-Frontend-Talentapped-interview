import React, { useState, useContext } from 'react';
import Modern from './templates/Modern';
import Classic from './templates/Classic';
import Clean from './templates/Clean';
import BoxSkills from './templates/BoxSkills';
import Elegant from './templates/Elegant';
import { exportPdf } from '../utils/pdfExport';
import ResumeContext from '../context/ResumeContext';
import validate from '../utils/validate'; // centralized validation

function ResumePreview({ data: propData, template }) {
  // Prefer context data if available 
  const ctx = useContext(ResumeContext);
  const data = propData || (ctx && ctx.data) || {};
  const [loading, setLoading] = useState(false);

  const templateMap = {
    modern: <Modern data={data} />,
    classic: <Classic data={data} />,
    clean: <Clean data={data} />,
    boxes: <BoxSkills data={data} />,
    elegant: <Elegant data={data} />
  };

  // compute validation synchronously from current data
  const errors = validate(data);
  const isValid = Object.keys(errors).length === 0;

  const handleExport = async () => {
    if (!isValid) {
      const firstKey = Object.keys(errors)[0];
      const firstMsg = errors[firstKey];
      alert(`Fix form errors before downloading: ${firstMsg}`);
      return;
    }
    try {
      setLoading(true);
      await exportPdf('resume-root');
    } catch (err) {
      console.error('export error', err);
      alert('PDF failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>{templateMap[template] || templateMap.modern}</div>

      {/* download */}
      <button
        className="download-fixed no-print"
        onClick={handleExport}
        disabled={loading || !isValid}
        aria-label="Download PDF"
        title={isValid ? 'Download PDF' : 'Fix form errors before downloading'}
      >
        {loading ? 'Generating...' : 'Download PDF'}
      </button>
    </div>
  );
}

export default ResumePreview;
