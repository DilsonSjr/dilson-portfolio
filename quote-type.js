const heading = document.querySelector('.quote h1');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
if (heading) {
  const words = [...heading.children].map(line => line.textContent);
  const original = heading.innerHTML;
  let timer;
  function setup() {
    clearTimeout(timer);
    heading.innerHTML = original;
    if (motion.matches) return;
    heading.setAttribute('aria-label', words.join(' '));
    const cursor = document.createElement('i');
    cursor.className = 'type-cursor';
    cursor.style.fontStyle = 'normal';
    cursor.textContent = '_';
    const lines = [...heading.children].map((line, i) => {
      line.setAttribute('aria-hidden', 'true');
      const word = document.createElement('span');
      word.className = 'type-word';
      const base = document.createElement('span');
      base.className = 'type-base';
      base.textContent = words[i];
      const ink = document.createElement('span');
      ink.className = 'type-ink';
      word.append(base, ink);
      line.replaceChildren(word);
      return {word, ink};
    });
    const total = words.join(' ').length;
    let count = 0;
    function tick() {
      let start = 0;
      lines.forEach(({word, ink}, i) => {
        const length = words[i].length;
        ink.textContent = words[i].slice(0, Math.max(0, count - start));
        if (count >= start && count <= start + length) {
          if (cursor.parentNode !== word) word.append(cursor);
          cursor.style.left = (100 * (count - start) / length) + '%';
        }
        start += length + 1;
      });
      if (count === total) { cursor.remove(); return; }
      count++;
      timer = setTimeout(tick, 75);
    }
    tick();
  }
  setup();
  motion.addEventListener('change', setup);
}