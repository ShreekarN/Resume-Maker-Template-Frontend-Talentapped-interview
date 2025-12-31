import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TemplateSelector from './pages/TemplateSelector';
import Builder from './pages/Builder';
import { ResumeProvider } from './context/ResumeContext';

function App() {
  return (
    <ResumeProvider>
      <Routes>
        <Route path="/" element={<TemplateSelector />} />
        <Route path="/builder/:template" element={<Builder />} />
      </Routes>
    </ResumeProvider>
  );
}

export default App;
