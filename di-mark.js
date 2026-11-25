const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const marks = [...document.querySelectorAll('.di-mark')].map(element => ({
  element, letters: [...element.children], visible: false, pulse: -Infinity, pressure: Array(element.children.length).fill(0.5)
}));
let pointer = null;
let frame = 0;
function start() {
  if (!frame && !reduced.matches && !document.hidden && marks.some(mark => mark.visible)) {
    frame = requestAnimationFrame(draw);
  }
}
function draw(time) {
  frame = 0;
  for (const mark of marks.filter(item => item.visible)) {
    const box = mark.element.getBoundingClientRect();
    mark.letters.forEach((letter, i) => {
      const distance = pointer ? Math.hypot(pointer.x - box.left - box.width * ((i + .5) / mark.letters.length), pointer.y - box.top - box.height / 2) : Infinity;
      const proximity = Math.max(0, 1 - distance / (box.width * 1.5));
      const wave = .35 + .18 * Math.sin(time / 520 - i * 1.5);
      const age = time - mark.pulse - i * 65;
      const ripple = age >= 0 && age < 400 ? .45 * Math.sin(Math.PI * age / 400) : 0;
      const target = Math.min(1, wave + proximity * (.98 - wave) + ripple);
      const p = mark.pressure[i] += (target - mark.pressure[i]) * .15;
      letter.style.fontVariationSettings = '"wght" ' + Math.round(350 + 550 * p);
      letter.style.transform = 'scaleX(' + (.91 + .15 * p) + ') skewX(' + (-8 * p) + 'deg)';
    });
  }
  start();
}
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) marks.find(mark => mark.element === entry.target).visible = entry.isIntersecting;
  start();
});
for (const mark of marks) {
  observer.observe(mark.element);
  mark.element.closest('a').addEventListener('pointerdown', () => { mark.pulse = performance.now(); });
}
addEventListener('pointermove', event => { pointer = {x:event.clientX, y:event.clientY}; }, {passive:true});
document.addEventListener('pointerleave', () => { pointer = null; });
document.addEventListener('visibilitychange', start);
reduced.addEventListener('change', () => {
  cancelAnimationFrame(frame); frame = 0;
  for (const mark of marks) for (const letter of mark.letters) letter.removeAttribute('style');
  start();
});