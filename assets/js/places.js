const places = [
  {
    name: { it: "Modena", en: "Modena" },
    latitude: 44.65, longitude: 10.93,
    types: ["study", "work", "research"], period: "2013–2026",
    description: {
      it: "UNIMORE: formazione universitaria, dottorato, didattica e progetti di ricerca.",
      en: "UNIMORE: university education, doctoral studies, teaching and research projects."
    }
  },
  {
    name: { it: "Reggio Emilia", en: "Reggio Emilia" },
    latitude: 44.7, longitude: 10.63,
    types: ["study", "work", "research"], period: "2013–2026",
    description: {
      it: "Formazione, attività universitarie, tutoraggio e ricerca educativa sul territorio.",
      en: "Education, university activities, tutoring and local educational research."
    }
  },
  {
    name: { it: "Leiden", en: "Leiden" },
    latitude: 52.16, longitude: 4.49,
    types: ["study", "research", "work"], period: "2026",
    description: {
      it: "Visiting PhD student presso Leiden University, formazione in R e collaborazione scientifica.",
      en: "Visiting PhD student at Leiden University, R training and research collaboration."
    }
  },
  {
    name: { it: "Amsterdam", en: "Amsterdam" },
    latitude: 52.37, longitude: 4.9,
    types: ["research", "conference"], period: "2026",
    description: {
      it: "Building 4 Belonging Consortium Meeting presso Vrije Universiteit Amsterdam.",
      en: "Building 4 Belonging Consortium Meeting at Vrije Universiteit Amsterdam."
    }
  },
  {
    name: { it: "Debrecen", en: "Debrecen" },
    latitude: 47.53, longitude: 21.63,
    types: ["study"], period: "2018",
    description: {
      it: "Semestre Erasmus presso University of Debrecen.",
      en: "Erasmus semester at the University of Debrecen."
    }
  },
  {
    name: { it: "Verona", en: "Verona" },
    latitude: 45.44, longitude: 10.99,
    types: ["work", "research"], period: "2025",
    description: {
      it: "Collaborazione alla raccolta e analisi dei dati del progetto PASSION.",
      en: "Collaboration on data collection and analysis for the PASSION project."
    }
  },
  {
    name: { it: "Pavia", en: "Pavia" },
    latitude: 45.19, longitude: 9.16,
    types: ["conference"], period: "2024",
    description: {
      it: "Contributi a ISYDE, Italian Symposium on Digital Education.",
      en: "Contributions to ISYDE, the Italian Symposium on Digital Education."
    }
  },
  {
    name: { it: "Bergamo", en: "Bergamo" },
    latitude: 45.7, longitude: 9.67,
    types: ["conference"], period: "2025",
    description: {
      it: "Contributi al Congresso Nazionale AIP, Psicologia Sociale.",
      en: "Contributions to the national AIP Social Psychology congress."
    }
  },
  {
    name: { it: "Udine", en: "Udine" },
    latitude: 46.06, longitude: 13.24,
    types: ["conference"], period: "2025",
    description: {
      it: "Poster al Congresso Nazionale AIP, Psicologia dello Sviluppo e dell’Educazione.",
      en: "Poster at the national AIP Developmental and Educational Psychology congress."
    }
  },
  {
    name: { it: "Ferrara", en: "Ferrara" },
    latitude: 44.84, longitude: 11.62,
    types: ["study", "conference"], period: "2025–2026",
    description: {
      it: "Summer School in Media Education; poster sulle tecnologie indossabili nel 2026.",
      en: "Summer Schools in Media Education; poster on wearable technologies in 2026."
    }
  },
  {
    name: { it: "Pisa", en: "Pisa" },
    latitude: 43.72, longitude: 10.4,
    types: ["conference"], period: "2026",
    description: {
      it: "Poster al XXXVIII Congresso Nazionale AIP, Psicologia dello Sviluppo e dell’Educazione.",
      en: "Poster at the 38th AIP Developmental and Educational Psychology congress."
    }
  },
  {
    name: { it: "Roma", en: "Rome" },
    latitude: 41.9, longitude: 12.5,
    types: ["conference"], period: "2026",
    description: {
      it: "Contributo al XXV Congresso Nazionale AIPS.",
      en: "Contribution to the 25th national AIPS congress."
    }
  },
  {
    name: { it: "Mantova", en: "Mantua" },
    latitude: 45.16, longitude: 10.79,
    types: ["work"], period: "2025",
    description: {
      it: "Presentazione di orientamento universitario al Liceo d’Este.",
      en: "University orientation presentation at Liceo d’Este."
    }
  },
  {
    name: { it: "Granada", en: "Granada" },
    latitude: 37.18, longitude: -3.6,
    types: ["conference"], period: "2026",
    description: {
      it: "Contributo al congresso AITANA su EMA, benessere, solitudine e appartenenza scolastica.",
      en: "Contribution to the AITANA congress on EMA, well-being, loneliness and school belonging."
    }
  },
];

const svgNamespace = 'http://www.w3.org/2000/svg';
const views = {
  europe: { box: '0 0 684 525' },
  italy: { box: '325 208 220 220', west: 7.05, east: 19.25, south: 38.88, north: 47.68 }
};

function visibleInView(place, view) {
  if (view === 'europe') return true;
  const bounds = views[view];
  return place.longitude >= bounds.west && place.longitude <= bounds.east &&
         place.latitude >= bounds.south && place.latitude <= bounds.north;
}

export function initPlaces() {
  const svg = document.getElementById('journey-map');
  const pins = document.getElementById('map-pins');
  const list = document.getElementById('place-list');
  const detail = document.getElementById('place-detail');
  const filters = document.querySelector('.map-filters');
  const zoom = document.querySelector('.map-zoom');
  // Draw the selected pin on top without moving its keyboard focus or tab position.
  const highlight = document.createElementNS(svgNamespace, 'use');
  highlight.setAttribute('aria-hidden', 'true');
  highlight.setAttribute('pointer-events', 'none');

  let filter = 'all';
  let view = 'europe';
  let selected = 0;
  let controls = new Map();

  function updateSelection() {
    for (const [index, { pin, button }] of controls) {
      const pressed = String(index === selected);
      pin.setAttribute('aria-pressed', pressed);
      button.setAttribute('aria-pressed', pressed);
    }

    const language = document.documentElement.lang;
    const place = places[selected];
    if (!place) {
      highlight.removeAttribute('href');
      detail.textContent = language === 'it' ? 'Nessun luogo in questa selezione.' : 'No places in this selection.';
      return;
    }

    highlight.setAttribute('href', '#' + controls.get(selected).pin.id);
    const title = document.createElement('h3');
    const period = document.createElement('small');
    const description = document.createElement('p');
    title.textContent = place.name[language];
    period.textContent = place.period;
    description.textContent = place.description[language];
    detail.replaceChildren(title, period, description);
  }

  function select(index) {
    if (index === selected || !controls.has(index)) return;
    selected = index;
    updateSelection();
  }

  function render() {
    const language = document.documentElement.lang;
    const markers = document.createDocumentFragment();
    const rows = document.createDocumentFragment();
    controls = new Map();

    places.forEach((place, index) => {
      if (filter !== 'all' && !place.types.includes(filter)) return;
      if (!visibleInView(place, view)) return;
      const name = place.name[language];
      const pin = document.createElementNS(svgNamespace, 'circle');
      pin.id = 'place-pin-' + index;
      pin.dataset.place = index;
      pin.setAttribute('cx', (place.longitude + 11) * 18);
      pin.setAttribute('cy', (56 - place.latitude) * 25);
      pin.setAttribute('r', view === 'italy' ? 2.6 : 4.4);
      pin.setAttribute('tabindex', '0');
      pin.setAttribute('role', 'button');
      pin.setAttribute('aria-label', name);
      const tooltip = document.createElementNS(svgNamespace, 'title');
      tooltip.textContent = name;
      pin.append(tooltip);
      markers.append(pin);

      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.place = index;
      const period = document.createElement('small');
      period.textContent = place.period;
      button.append(name, period);
      rows.append(button);
      controls.set(index, { pin, button });
    });

    pins.replaceChildren(markers, highlight);
    list.replaceChildren(rows);
    if (!controls.has(selected)) selected = controls.keys().next().value;
    updateSelection();
  }

  function selectFromTarget(event) {
    const control = event.target.closest('[data-place]');
    if (control) select(Number(control.dataset.place));
  }
  list.addEventListener('click', selectFromTarget);
  pins.addEventListener('click', selectFromTarget);
  pins.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    selectFromTarget(event);
  });

  function updatePressed(group, active) {
    for (const button of group.querySelectorAll('button')) {
      button.setAttribute('aria-pressed', String(button === active));
    }
  }

  filters.addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (!button || filter === button.dataset.filter) return;
    filter = button.dataset.filter;
    updatePressed(filters, button);
    render();
  });
  zoom.addEventListener('click', event => {
    const button = event.target.closest('button[data-view]');
    if (!button || view === button.dataset.view) return;
    view = button.dataset.view;
    svg.setAttribute('viewBox', views[view].box);
    updatePressed(zoom, button);
    render();
  });

  render();
  return render;
}
