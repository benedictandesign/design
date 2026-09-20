let sectionObserver;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function projectCard(project, index) {
  const card = element('a', 'project-card');
  card.href = project.url;
  card.style.setProperty('--card-index', index);

  const image = element('img');
  image.src = project.imageUrl;
  image.alt = '';
  image.loading = 'lazy';

  const content = element('span', 'project-card-content');
  const number = element('span', 'project-card-index', String(index + 1).padStart(2, '0'));
  const copy = element('span', 'project-card-copy');
  copy.append(element('strong', 'project-card-title', project.title));
  copy.append(element('span', 'project-card-type', project.type));
  const arrow = element('span', 'project-card-arrow', '↗');
  arrow.setAttribute('aria-hidden', 'true');

  content.append(number, copy, arrow);
  card.append(image, content);
  return card;
}

function experienceHeader(data) {
  const header = element('header', 'experience-header');
  header.innerHTML = `
    <p class="experience-eyebrow">${data.eyebrow}</p>
    <h1>${data.title}</h1>
    ${data.introduction ? `<p class="experience-introduction">${data.introduction}</p>` : ''}
    <div class="scroll-cue"><span></span>SCROLL TO EXAMINE</div>
  `;
  return header;
}

function observeSections(viewport, selector, onActive) {
  sectionObserver?.disconnect();
  const sections = [...viewport.querySelectorAll(selector)];
  sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) onActive(visible.target);
  }, { root: viewport.closest('#overlay'), threshold: [0.2, 0.45, 0.7] });
  sections.forEach(section => sectionObserver.observe(section));
}

function renderWorks(viewport, data) {
  viewport.appendChild(experienceHeader(data));

  const anatomy = element('div', 'anatomy-layout');
  const index = element('aside', 'anatomy-index');
  index.innerHTML = `
    <p class="index-label">BODY INDEX</p>
    <div class="anatomy-axis" aria-hidden="true"><i></i><i></i><i></i></div>
  `;

  const navigation = element('nav', 'anatomy-navigation');
  navigation.setAttribute('aria-label', 'Work systems');
  data.sections.forEach((section) => {
    const button = element('button', 'anatomy-navigation-item');
    button.type = 'button';
    button.dataset.target = section.id;
    button.innerHTML = `<span>${section.index}</span><strong>${section.title}</strong><small>${section.system.split(' / ')[0]}</small>`;
    button.addEventListener('click', () => document.getElementById(`works-${section.id}`)?.scrollIntoView({ behavior: 'smooth' }));
    navigation.appendChild(button);
  });
  index.appendChild(navigation);

  const clusters = element('main', 'work-clusters');
  data.sections.forEach((section) => {
    const cluster = element('section', 'work-cluster');
    cluster.id = `works-${section.id}`;
    cluster.dataset.region = section.id;
    cluster.innerHTML = `
      <div class="cluster-heading">
        <p>${section.index} / ${section.system}</p>
        <h2>${section.title}</h2>
      </div>
    `;
    const grid = element('div', 'project-grid');
    section.projects.forEach((project, projectIndex) => grid.appendChild(projectCard(project, projectIndex)));
    cluster.appendChild(grid);
    clusters.appendChild(cluster);
  });

  anatomy.append(index, clusters);
  viewport.appendChild(anatomy);

  observeSections(viewport, '.work-cluster', (active) => {
    const region = active.dataset.region;
    viewport.dataset.activeRegion = region;
    document.body.dataset.activeRegion = region;
    viewport.querySelectorAll('.anatomy-navigation-item').forEach(item => {
      item.classList.toggle('active', item.dataset.target === region);
    });
  });
}

function renderAbout(viewport, data) {
  viewport.appendChild(experienceHeader(data));

  const registration = element('main', 'registration-layout');
  const scanColumn = element('aside', 'subject-scan-column');
  const scan = element('div', 'subject-scan');
  scan.innerHTML = `
    <div class="scan-corners" aria-hidden="true"></div>
    <div class="scan-crosshair" aria-hidden="true"></div>
    <img src="${data.scan.imageUrl}" alt="Point-cloud silhouette of Benedict Tan">
  `;
  scanColumn.appendChild(scan);

  const record = element('article', 'subject-record');
  const biography = element('section', 'profile-biography');
  biography.append(
    element('p', 'profile-role', 'ARCHITECTURE / AI / SPECULATIVE FUTURES'),
    element('h2', '', 'Benedict Tan')
  );
  const biographyCopy = element('div', 'profile-biography-copy');
  data.bio.forEach(paragraph => biographyCopy.appendChild(element('p', '', paragraph)));
  biography.appendChild(biographyCopy);
  record.appendChild(biography);

  const contact = element('section', 'contact-record');
  contact.innerHTML = '<p>OPEN CHANNELS</p><h3>Connect</h3>';
  data.contact.forEach((channel) => {
    const link = element('a', 'contact-channel');
    link.href = channel.url;
    if (channel.url.startsWith('http')) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    link.innerHTML = `<span>${channel.label}</span><strong>${channel.value}</strong><i aria-hidden="true">↗</i>`;
    contact.appendChild(link);
  });
  record.appendChild(contact);

  registration.append(scanColumn, record);
  viewport.appendChild(registration);
}

export function renderOverlay(viewport, section, data) {
  sectionObserver?.disconnect();
  viewport.replaceChildren();
  viewport.className = `overlay-experience ${section}-experience`;
  delete viewport.dataset.activeRegion;
  delete viewport.dataset.activeStage;

  if (section === 'works') renderWorks(viewport, data);
  if (section === 'about') renderAbout(viewport, data);
}
