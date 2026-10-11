/* ---------------------------------------------------------------------
   export-html.js — Download brand guide as a standalone HTML document.
------------------------------------------------------------------------ */

function downloadBrandGuideHtml(state) {
  // Build Google Fonts URL
  // Same family rule as the app (googleFamilyParam in data.js): real weights
  // for each face, plus the true italic where the family has one. Families
  // must be alphabetical and de-duplicated for the css2 endpoint.
  const fontParams = [state.headingFont, state.bodyFont]
    .filter((f, i, a) => a.findIndex(x => x.name === f.name) === i)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(f => googleFamilyParam(f))
    .join('&');
  const fontsUrl = `https://fonts.googleapis.com/css2?${fontParams}&display=swap`;

  // Build the complete HTML document
  const brandGuideContent = renderBrandGuideHTML(state);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(state.content.brandName || 'Brand')} — Brand Guide</title>
  <link rel="stylesheet" href="${fontsUrl}">
  <style>
    body { margin: 0; background: #f4f4f6; padding: 24px; }
    ${BRAND_GUIDE_CSS}
  </style>
</head>
<body>
  <div class="brand-guide-doc">
    ${brandGuideContent}
  </div>
</body>
</html>`;

  // Create blob and download
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const filename = `${brandFileSlug()}-brand-guide.html`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
