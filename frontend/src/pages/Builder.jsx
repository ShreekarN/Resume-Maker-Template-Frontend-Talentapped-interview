import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import ResumeForm from '../components/ResumeForm';
import ResumePreview from '../components/ResumePreview';
import { ResumeContext } from '../context/ResumeContext';

function Builder() {
  const { template } = useParams();
  const { data } = useContext(ResumeContext);

  return (
    <div className="container">
      <h2>Builder — {template}</h2>
      <div className="split">
        <div className="left">
          <ResumeForm />
        </div>
        <div className="right">
          <div className="preview" id="resume-root">
            <ResumePreview data={data} template={template} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Builder;
