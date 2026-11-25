import { getDocument, GlobalWorkerOptions } from './assets/vendor/pdf.min.mjs';
GlobalWorkerOptions.workerSrc = '/assets/vendor/pdf.worker.min.mjs';

export async function renderResume(paper, slot, onLayout) {
  const pdf = await getDocument({
    url: '/resume/resume.pdf', standardFontDataUrl: '/assets/vendor/standard_fonts/',
    cMapUrl: '/assets/vendor/cmaps/', cMapPacked: true,
    wasmUrl: '/assets/vendor/wasm/', iccUrl: '/assets/vendor/iccs/', isEvalSupported: false
  }).promise;
  const pages = [];
  for (let index = 1; index <= pdf.numPages; index++) {
    const page = await pdf.getPage(index);
    const view = page.getViewport({ scale: 1 });
    const canvas = document.createElement('canvas');
    canvas.className = 'pdf-page';
    canvas.style.aspectRatio = view.width + ' / ' + view.height;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Resume, page ' + index + ' of ' + pdf.numPages);
    pages.push({ page, canvas, view });
  }
  paper.replaceChildren(...pages.map(item => item.canvas));
  slot.style.aspectRatio = 'auto';
  let previousWidth = 0;
  let drawing = false;
  async function paint() {
    if (drawing) return;
    drawing = true;
    try {
      let width;
      // If the viewport changes during a render, finish and repaint at the latest width.
      while ((width = Math.round(slot.clientWidth * Math.min(devicePixelRatio || 1, 2))) > 0 && width !== previousWidth) {
        previousWidth = width;
        for (const { page, canvas, view } of pages) {
          const viewport = page.getViewport({ scale: width / view.width });
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
          onLayout();
        }
      }
    } finally { drawing = false; }
  }
  await paint();
  new ResizeObserver(() => { paint().catch(() => {}); }).observe(slot);
}

