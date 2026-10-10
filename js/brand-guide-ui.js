/* -----------------------------------------------------------------
   brand-guide-ui.js — modal controls for brand guide display.
------------------------------------------------------------------------ */

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('brandGuideModal');
  const content = document.getElementById('brandGuideContent');

  document.getElementById('openBrandGuide').addEventListener('click', () => {
    injectBrandGuideStyles();
    content.innerHTML = renderBrandGuideHTML(state);
    modal.hidden = false;
  });

  document.getElementById('closeBrandGuide').addEventListener('click', () => {
    modal.hidden = true;
  });

  modal.addEventListener('click', e => {
    if (e.target === modal) modal.hidden = true;
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) modal.hidden = true;
  });

  document.getElementById('exportGuideHtml').addEventListener('click', () => {
    downloadBrandGuideHtml(state);
    showToast('Brand guide HTML downloaded');
  });

  document.getElementById('exportGuidePdf').addEventListener('click', async () => {
    const pdfBtn = document.getElementById('exportGuidePdf');
    pdfBtn.disabled = true;
    showToast('Building PDF…');
    try {
      await exportBrandGuidePdf(state);
      showToast('Brand guide PDF downloaded');
    } catch (err) {
      showToast('PDF export failed — check your connection and try again');
    } finally {
      pdfBtn.disabled = false;
    }
  });
});
