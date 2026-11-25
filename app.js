import { projects } from './projects.js';
import { enhance } from './figma-effects.js';

enhance();

const grid = document.querySelector('#project-grid');
function span(className, value) {
  const element = document.createElement('span');
  element.className = className;
  if (value) element.textContent = value;
  return element;
}
for (const [index, project] of projects.entries()) {
  const link = document.createElement('a');
  link.className = 'project';
  link.href = project.href;
  link.setAttribute('aria-label', project.title + ' — ' + project.description + ' See more');
  const inner = span('project-inner');
  const front = span('face front');
  const img = document.createElement('img');
  img.src = '/assets/projects/' + project.image + '.webp';
  img.alt = project.alt;
  img.loading = index < 3 ? 'eager' : 'lazy';
  img.decoding = 'async';
  front.append(img);
  const back = span('face back');
  back.setAttribute('aria-hidden', 'true');
  back.append(span('category', project.category), span('project-title', project.title),
    span('description', project.description), span('see-more', 'See more'));
  inner.append(front, back);
  link.append(inner);
  grid.append(link);
}

let openedCard;
let touchCard;
function closeCard() {
  openedCard?.classList.remove('is-open');
  openedCard = null;
}
document.addEventListener('pointerdown', (event) => {
  const card = event.target.closest('.project');
  touchCard = event.pointerType === 'touch' || event.pointerType === 'pen' ? card : null;
  if (card !== openedCard) closeCard();
});
grid.addEventListener('click', (event) => {
  const card = event.target.closest('.project');
  if (!card || card !== touchCard || event.detail === 0) return;
  if (card !== openedCard) {
    event.preventDefault();
    card.classList.add('is-open');
    openedCard = card;
  }
  touchCard = null;
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeCard();
});

