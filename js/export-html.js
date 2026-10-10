/* ---------------------------------------------------------------------
   export-html.js — Download brand guide as a standalone HTML document.
------------------------------------------------------------------------ */

function downloadBrandGuideHtml(state) {
  // Build Google Fonts URL
  const headingFont = state.headingFont.name;
  const bodyFont = state.bodyFont.name;
  const fontParams = [
    `family=${headingFont.replace(/ /g, '+')}:wght@400;700`,
    `family=${bodyFont.replace(/ /g, '+')}:wght@400;700`
  ].join('&');
  const fontsUrl = `https://fonts.googleapis.com/css2?${fontParams}&display=swap`;

  // Build the complete HTML document
  const brandGuideContent = renderBrandGuideHTML(state);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${state.content.brandName || 'Brand'} — Brand Guide</title>
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

  // Generate filename from brand name
  let filename = (state.content.brandName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!filename) filename = 'brand-guide';
  filename = `${filename}-brand-guide.html`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
