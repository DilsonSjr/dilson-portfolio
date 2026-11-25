const paragraphs = [...document.querySelectorAll('.about-copy p')];
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const originals = paragraphs.map(p => p.textContent);
let cleanup = () => {};
function setup() {
  cleanup();
  if (preference.matches) return;
  let frame = 0;
  const groups = paragraphs.map((p, index) => {
    const words = originals[index].split(/\s+/).map(text => {
      const span = document.createElement('span');
      span.textContent = text;
      span.className = 'about-word';
      return span;
    });
    p.replaceChildren(...words.flatMap((word, i) => i ? [' ', word] : [word]));
    return {p, words};
  });
  function paint() {
    frame = 0;
    const height = document.documentElement.clientHeight;
    const width = document.documentElement.clientWidth;
    for (const {p, words} of groups) {
      const box = p.getBoundingClientRect();
      if (box.bottom < 0 || box.top > height) continue;
      const rects = words.map(word => word.getBoundingClientRect());
      words.forEach((word, index) => {
        const rect = rects[index];
        const stagger = (rect.left - box.left) / width * .05;
        const progress = Math.max(0, Math.min(1, (.96 - rect.top / height - stagger) / .22));
        word.style.opacity = String(.28 + .72 * progress);
        word.style.filter = progress === 1 ? 'none' : 'blur(' + (1.5 * (1 - progress)) + 'px)';
      });
    }
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(paint); }
  paint();
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  const observer = new ResizeObserver(schedule);
  paragraphs.forEach(p => observer.observe(p));
  cleanup = () => {
    removeEventListener('scroll', schedule); removeEventListener('resize', schedule);
    observer.disconnect(); cancelAnimationFrame(frame);
    paragraphs.forEach((p,i) => { p.textContent = originals[i]; });
    cleanup = () => {};
  };
}
setup();
preference.addEventListener('change', setup);