import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function exportPdf(elementId) {
  const root = document.getElementById(elementId);
  if (!root) return;

  const hide = Array.from(document.querySelectorAll('.no-print'));
  const prev = hide.map(el => el.style.display);
  hide.forEach(el => el.style.display = 'none');

  try {
    // Capture links before render
    const links = Array.from(root.querySelectorAll('a[href]')).map(a => {
      const rect = a.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();
      return {
        href: a.href,
        x: rect.left - rootRect.left,
        y: rect.top - rootRect.top,
        width: rect.width,
        height: rect.height
      };
    });

    const scale = 2;

    const canvas = await html2canvas(root, {
      scale,
      backgroundColor: '#ffffff',
      useCORS: true
    });

    const imgData = canvas.toDataURL('image/png');

    const pdfWidth = 794;
    const pdfHeight = 1123;

    const pdf = new jsPDF('p', 'px', [pdfWidth, pdfHeight]);
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // Add clickable link
    links.forEach(link => {
      pdf.link(
        link.x * (pdfWidth / (canvas.width / scale)),
        link.y * (pdfHeight / (canvas.height / scale)),
        link.width * (pdfWidth / (canvas.width / scale)),
        link.height * (pdfHeight / (canvas.height / scale)),
        { url: link.href }
      );
    });

    // derive filename
    function deriveNameFromRoot(r) {
      const sels = [
        '[data-candidate-name]',
        '[data-name]',
        '[data-fullname]',
        '.candidate-name',
        '.full-name',
        '.name',
        'h1',
        'h2'
      ];
      for (const s of sels) {
        const el = r.querySelector(s);
        if (el && el.textContent && el.textContent.trim().length > 0) {
          return el.textContent.trim();
        }
      }
      const bold = r.querySelector('strong') || r.querySelector('b');
      if (bold && bold.textContent && bold.textContent.trim().length > 0) {
        return bold.textContent.trim();
      }
      return '';
    }

    // sanitize filename
    function sanitizeName(n) {
      if (!n) return '';
      const cleaned = n
        .replace(/[\/\\:?<>|*"']/g, '') // remove illegal chars
        .trim()
        .replace(/\s+/g, '_') // spaces -> underscore
        .replace(/_{2,}/g, '_');
      return cleaned.slice(0, 120); // limit length
    }

    const rawName = deriveNameFromRoot(root);
    const safeName = sanitizeName(rawName);
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const outName = safeName ? `${safeName}_${datePart}.pdf` : `resume_${datePart}.pdf`;

    pdf.save(outName);
  } finally {
    hide.forEach((el, i) => el.style.display = prev[i]);
  }
}
