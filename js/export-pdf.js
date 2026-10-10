/* ---------------------------------------------------------------------
   export-pdf.js — Export the brand guide straight to a downloaded PDF
   file, with no browser print dialog in the way. Each guide page is
   rasterized with html2canvas and dropped into its own PDF page via
   jsPDF (both loaded from a CDN in index.html, same as the Google Fonts
   stylesheet the rest of the app already depends on).
------------------------------------------------------------------------ */

async function exportBrandGuidePdf(state) {
  injectBrandGuideStyles();

  // Render the guide into an offscreen container — same content as the
  // on-page modal, just positioned outside the viewport so it doesn't
  // affect layout while html2canvas rasterizes it.
  let container = document.getElementById('brandGuideExportRoot');
  if (!container) {
    container = document.createElement('div');
    container.id = 'brandGuideExportRoot';
    container.className = 'brand-guide-doc';
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.width = '900px';
    document.body.appendChild(container);
  }
  container.innerHTML = renderBrandGuideHTML(state);

  // Let layout settle and webfonts finish before rasterizing. Deliberately
  // uses setTimeout rather than requestAnimationFrame here — rAF callbacks
  // are paused by the browser while the tab is backgrounded/hidden, which
  // would hang this whole export indefinitely if the user switches away
  // mid-export; a timer still fires (possibly throttled, but it fires).
  // document.fonts.ready can also occasionally hang past when things
  // actually look done (e.g. injecting this much fresh text can trigger
  // additional font subset requests), so it's raced against a timeout too.
  await new Promise(resolve => setTimeout(resolve, 50));
  if (document.fonts && document.fonts.ready) {
    try {
      await Promise.race([
        document.fonts.ready,
        new Promise(resolve => setTimeout(resolve, 1500)),
      ]);
    } catch (e) { /* ignore, proceed with whatever is loaded */ }
  }

  const pages = Array.from(container.querySelectorAll('.bg-page'));
  if (!pages.length) return;

  const { jsPDF } = window.jspdf;
  let pdf = null;

  for (let i = 0; i < pages.length; i++) {
    const canvas = await html2canvas(pages[i], { scale: 2, backgroundColor: '#ffffff', useCORS: true });
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    // canvas is rendered at scale:2, so divide back down to CSS px for the
    // PDF page size — 1 PDF "px" unit maps 1:1 to a CSS px this way.
    const pageW = canvas.width / 2;
    const pageH = canvas.height / 2;

    if (!pdf) {
      pdf = new jsPDF({ unit: 'px', format: [pageW, pageH], hotfixes: ['px_scaling'] });
    } else {
      pdf.addPage([pageW, pageH]);
    }
    pdf.addImage(imgData, 'JPEG', 0, 0, pageW, pageH);
  }

  const filename = (state.content.brandName || 'brand-guide')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'brand-guide';
  pdf.save(`${filename}-brand-guide.pdf`);
}
