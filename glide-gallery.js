const GLIDE_OPTIONS = {
  type: 'carousel',
  startAt: 0,
  perView: 1,
  focusAt: 'center',
  gap: 5,
  peek: { before: 0, after: 0 },
  animationDuration: 400,
  hoverpause: true,
  keyboard: true
};

function parseImages(value) {
  if (!value) return [];

  try {
    const images = JSON.parse(value);
    return Array.isArray(images) ? images : [];
  } catch {
    return value.split(',');
  }
}

function imageMarkup(images, wrapper = false) {
  return images
    .map((source) => {
      const src = String(source).trim();
      const image = `<img src="${src}" alt="" loading="lazy">`;
      return wrapper ? `<li class="glide__slide">${image}</li>` : image;
    })
    .join('');
}

class GlideGallery extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === 'true') return;

    const images = parseImages(this.getAttribute('images'));
    if (!images.length) return;

    this.dataset.initialized = 'true';
    const layout = (this.getAttribute('layout') || 'carousel').toLowerCase();

    if (layout === 'grid') {
      this.renderGrid(images);
      return;
    }

    this.renderCarousel(images);
  }

  renderGrid(images) {
    const grid = document.createElement('section');
    grid.className = 'image-grid';

    const columns = Number.parseInt(this.getAttribute('cols'), 10);
    if (columns > 0) {
      grid.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
    }

    grid.innerHTML = imageMarkup(images);
    this.appendChild(grid);
  }

  renderCarousel(images) {
    const section = document.createElement('section');
    section.className = 'project-carousel';
    section.innerHTML = `
      <div class="glide">
        <div class="glide__track" data-glide-el="track">
          <ul class="glide__slides">${imageMarkup(images, true)}</ul>
        </div>
        <div class="glide__arrows" data-glide-el="controls">
          <button class="glide__arrow glide__arrow--left" data-glide-dir="<" aria-label="Previous image">‹</button>
          <button class="glide__arrow glide__arrow--right" data-glide-dir=">" aria-label="Next image">›</button>
        </div>
      </div>
    `;

    this.appendChild(section);
    new Glide(section.querySelector('.glide'), GLIDE_OPTIONS).mount();
  }
}

if (!customElements.get('glide-gallery')) {
  customElements.define('glide-gallery', GlideGallery);
}
