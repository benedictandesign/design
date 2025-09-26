// overlayRenderer.js

/**
 * Renders a note at an absolute position within the overlay viewport.
 * @param {HTMLElement} viewport - The container element for overlay content.
 * @param {Object} note - An object with x, y, cls, txt.
 */
export function addNote(viewport, { x, y, cls, txt, width, fontSize, isHTML }) {
  const n = document.createElement('div');
  n.className   = `note ${cls}`;
  n.style.left  = `${x}px`;
  n.style.top   = `${y}px`;
  n.style.padding = '25px';
  
    // 1. Set the width, fontsize if it's provided
  if (width) {
    n.style.width = `${width}px`;
  }

  if (fontSize) {
    n.style.fontSize = fontSize;
  }

  // 2. Render content: if explicit HTML, don't inject <br> into SVGs
  if (isHTML) {
    n.innerHTML = txt;
  } else {
    n.innerHTML = txt.replace(/\n/g, '<br>');
  }

  // If this note is intended to be interactive (e.g., contains links/icons),
  // add listeners to avoid starting the overlay pan on interaction.
  if (n.classList.contains('clickable')) {
    n.style.pointerEvents = 'auto';
    n.addEventListener('mousedown', e => e.stopPropagation());
    n.addEventListener('touchstart', e => e.stopPropagation());
  }

  viewport.appendChild(n);
}

/**
 * Renders a project card at an absolute position within the overlay viewport.
 * Clicking the card opens the project URL in a new tab/window.
 * @param {HTMLElement} viewport - The container element for overlay content.
 * @param {Object} project - An object with x, y, imageUrl, title, type, and url.
 */
export function addProjectCard(viewport, { x, y, imageUrl, title, type, url }) {
  const card = document.createElement('div');
  card.className = 'project-card';
  card.style.left = `${x}px`;
  card.style.top  = `${y}px`;

  card.innerHTML = `
    <img src="${imageUrl}" alt="${title}">
    <div class="project-card-content">
      <h3 class="project-card-title">${title}</h3>
      <p class="project-card-type">${type}</p>
    </div>
  `;

  // Prevent the viewport from panning when you click on a card
  card.addEventListener('mousedown', e => e.stopPropagation());
  card.addEventListener('touchstart', e => e.stopPropagation());

  // Open the project URL in a new tab/window when clicked
  card.addEventListener('click', () => {
    window.open(url, '_blank');
  });

  viewport.appendChild(card);
}

/**
 * NEW FUNCTION
 * Renders a profile image at an absolute position within the overlay viewport.
 * @param {HTMLElement} viewport - The container element for overlay content.
 * @param {Object} imgData - The profile image data object.
 */
export function addProfileImage(viewport, { x, y, width, height, imageUrl, backgroundColor }) {
  const container = document.createElement('div');
  container.className = 'profile-image-container';
  container.style.left = `${x}px`;
  container.style.top = `${y}px`;
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.backgroundColor = backgroundColor;

  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = 'Profile Picture'; // Good for accessibility

  img.addEventListener('dragstart', (e) => e.preventDefault());

  container.appendChild(img);
  viewport.appendChild(container);
}

/**
 * Renders a section panel at an absolute position within the overlay viewport.
 * @param {HTMLElement} viewport - The container element for overlay content.
 * @param {Object} panel - An object with x, y, width, height.
 */
export function addSectionPanel(viewport, { x, y, width, height }) {
  const panel = document.createElement('div');
  panel.className = 'section-panel';
  panel.style.left = `${x}px`;
  panel.style.top = `${y}px`;
  panel.style.width = `${width}px`;
  panel.style.height = `${height}px`;
  viewport.appendChild(panel);
}
