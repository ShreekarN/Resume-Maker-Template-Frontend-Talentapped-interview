import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Modern from '../components/templates/Modern';
import Classic from '../components/templates/Classic';
import Clean from '../components/templates/Clean';
import BoxSkills from '../components/templates/BoxSkills';
import Elegant from '../components/templates/Elegant';
import { ResumeContext } from '../context/ResumeContext';

// selector
function TemplateSelector() {
  const navigate = useNavigate();
  const { data } = useContext(ResumeContext);

  const templates = [
    { id: 'modern', name: 'Modern', desc: 'Sidebar layout', comp: <Modern data={data} /> },
    { id: 'classic', name: 'Classic', desc: 'Serif resume', comp: <Classic data={data} /> },
    { id: 'clean', name: 'Clean', desc: 'Minimal single column', comp: <Clean data={data} /> },
    { id: 'boxes', name: 'Box skills', desc: 'Skills tiles', comp: <BoxSkills data={data} /> },
    { id: 'elegant', name: 'Elegant', desc: 'Magazine style', comp: <Elegant data={data} /> }
  ];

  const goBuilder = (id) => navigate(`/builder/${id}`);

  return (
    <div className="container">
      <h2 style={{ marginBottom: 12 }}>Choose a template</h2>

      <div className="grid" style={{ gap: 20 }}>
        {templates.map(t => (
          <div key={t.id} className="card" style={{ width: 300 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <strong style={{ display: 'block' }}>{t.name}</strong>
                <small style={{ color: '#666' }}>{t.desc}</small>
              </div>
              <button onClick={() => goBuilder(t.id)} style={{ padding: '6px 10px', background: '#0b63b3', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Use</button>
            </div>

            <div style={{ height: 180, overflow: 'hidden', background: '#fafafa', borderRadius: 6 }}>
              <div style={{ transform: 'scale(0.62)', transformOrigin: 'top left', width: 480 }}>
                {t.comp}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TemplateSelector;
