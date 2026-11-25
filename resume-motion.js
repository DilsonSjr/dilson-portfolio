export function setupResumeMotion(profile, scrollRoot = window) {
  const about = profile.querySelector('.about-row');
  const mini = profile.querySelector('.mini-slot');
  const anchor = profile.querySelector('.resume-anchor');
  const reader = profile.querySelector('.reader');
  const cover = reader.querySelector('.resume-cover');
  const bar = reader.querySelector('.reader-bar');
  const slot = reader.querySelector('.document-slot');
  const paper = reader.querySelector('.document');
  const embedded = scrollRoot !== window;
  const scroller = embedded ? scrollRoot : document.scrollingElement;
  let expanded = false;
  let frame = 0;

  function pastAbout() {
    const bounds = about.getBoundingClientRect();
    const viewportTop = embedded ? scrollRoot.getBoundingClientRect().top + scrollRoot.clientTop : 0;
    const height = embedded ? scrollRoot.clientHeight : window.innerHeight;
    const scroll = scroller.scrollTop;
    // Keep the PDF compact until the last lines of About me reach the top.
    const sectionEnd = scroll + bounds.bottom - viewportTop;
    const readingLine = Math.min(64, height * .08);
    // A short footer may put that line beyond the last reachable compact position.
    const extraSpace = parseFloat(profile.style.paddingBottom) || 0;
    const compactLimit = Math.max(0, scroller.scrollHeight - extraSpace - height);
    const threshold = Math.min(sectionEnd - readingLine, compactLimit);
    return bounds.width > 0 && scroll > 0 && scroll >= threshold - (expanded ? 32 : 1);
  }

  function layout() {
    const bounds = about.getBoundingClientRect();
    if (!bounds.width) return;
    const thumb = mini.getBoundingClientRect();
    const padding = Math.min(36, Math.max(12, bounds.width * .022));
    const innerWidth = bounds.width - padding * 2;
    const paperWidth = Math.min(920, innerWidth);
    bar.style.width = innerWidth + 'px';
    slot.style.width = paperWidth + 'px';
    const firstPage = paper.querySelector('.pdf-page, .resume-scan');
    const firstHeight = firstPage?.offsetHeight || paperWidth * 842 / 595;
    const paperHeight = Math.max(firstHeight, slot.offsetHeight);
    const thumbScale = Math.min(thumb.width * .85 / paperWidth, thumb.height * .84 / firstHeight);
    const paperTop = expanded ? 2 * padding + bar.offsetHeight : thumb.height * .045;
    const height = expanded ? paperTop + paperHeight + padding : thumb.height;
    const top = expanded ? anchor.offsetTop : thumb.top - bounds.top;
    const left = expanded ? 0 : thumb.left - bounds.left;

    reader.style.transform = 'translate(' + left + 'px,' + top + 'px)';
    reader.style.width = (expanded ? bounds.width : thumb.width) + 'px';
    reader.style.height = height + 'px';
    slot.style.top = paperTop + 'px';
    slot.style.transform = 'translateX(-50%) scale(' + (expanded ? 1 : thumbScale) + ')';
    const clipped = expanded ? 0 : Math.max(0, paperHeight - firstHeight);
    slot.style.clipPath = 'inset(0 0 ' + clipped + 'px 0)';
    bar.style.top = padding + 'px';
    bar.style.opacity = expanded ? '1' : '0';
    cover.style.opacity = expanded ? '0' : '1';
    bar.inert = !expanded;
    cover.inert = expanded;
    profile.style.paddingBottom = Math.max(0, top + height - bounds.height) + 'px';
  }

  function setExpanded(next, animate) {
    if (next === expanded) return;
    // Only a change of state starts a transition. Scroll distance never sets its speed.
    expanded = next;
    profile.classList.toggle('resume-animating', animate);
    layout();
  }
  reader.addEventListener('transitionend', event => {
    if (event.target === reader && event.propertyName === 'transform') {
      profile.classList.remove('resume-animating');
    }
  });
  function onScroll() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      setExpanded(pastAbout(), true);
    });
  }
  function refresh() {
    layout();
    onScroll();
  }
  function prepareJump(hash) {
    if (hash === '#resume' || hash === '#contact') setExpanded(true, false);
  }
  const linkRoot = embedded ? scrollRoot : document;
  linkRoot.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (link && !link.hasAttribute('download')) prepareJump(link.hash);
  }, true);

  profile.classList.add('resume-motion');
  expanded = pastAbout();
  layout();
  if (!embedded) {
    const restoreAnchor = () => {
      if (location.hash !== '#resume' && location.hash !== '#contact') return;
      prepareJump(location.hash);
      document.querySelector(location.hash)?.scrollIntoView();
    };
    restoreAnchor();
    window.addEventListener('hashchange', restoreAnchor);
    window.addEventListener('pageshow', refresh);
  }
  scrollRoot.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', refresh);
  const sizes = new ResizeObserver(refresh);
  sizes.observe(about);
  sizes.observe(paper);
  sizes.observe(bar);
  if (embedded) sizes.observe(scrollRoot);
  return refresh;
}
