const config = window.APP_CONFIG || {};
const apiUrl = (config.API_URL || 'http://localhost:4000').replace(/\/$/, '');

const $ = (id) => document.getElementById(id);

function applyConfig() {
  const appName = config.APP_NAME || 'Kubernetes Lab';
  const message = config.WELCOME_MESSAGE || 'Frontend, Backend and Database are connected.';
  const theme = config.THEME_COLOR || '#7c5cff';

  document.title = appName;
  document.documentElement.style.setProperty('--accent', theme);
  $('app-name').textContent = appName;
  $('welcome-message').textContent = message;
  $('env-app-name').textContent = appName;
  $('env-message').textContent = message;
  $('env-api-url').textContent = apiUrl;
  $('env-theme').textContent = theme;
}

function setStatus(id, text, state) {
  const element = $(id);
  element.textContent = text;
  element.className = state;
}

function renderVisits(visits) {
  if (!visits.length) {
    $('visits').innerHTML = '<span class="muted">עדיין אין ביקורים.</span>';
    return;
  }

  $('visits').innerHTML = visits
    .map(
      (visit) => `
        <div class="visit">
          <span class="dot"></span>
          <b>Visit #${visit.id}</b>
          <code>${visit.source}</code>
          <time>${new Date(visit.created_at).toLocaleString('he-IL')}</time>
        </div>`
    )
    .join('');
}

async function loadSystem({ registerVisit = false } = {}) {
  setStatus('backend-status', 'בודק…', 'pending');
  setStatus('database-status', 'בודק…', 'pending');

  try {
    const readiness = await fetch(`${apiUrl}/api/health/ready`);
    if (!readiness.ok) throw new Error('Not ready');
    const health = await readiness.json();
    setStatus('backend-status', 'מחובר', 'ok');
    setStatus('database-status', health.database === 'connected' ? 'מחובר' : 'מנותק', health.database === 'connected' ? 'ok' : 'bad');

    if (registerVisit) {
      await fetch(`${apiUrl}/api/visits`, { method: 'POST' });
    }

    const response = await fetch(`${apiUrl}/api/visits`);
    if (!response.ok) throw new Error('Cannot load visits');
    const data = await response.json();
    $('visit-count').textContent = data.totalVisits;
    renderVisits(data.visits);
  } catch (_error) {
    setStatus('backend-status', 'לא זמין', 'bad');
    setStatus('database-status', 'לא ידוע', 'bad');
    $('visits').innerHTML = '<span class="error-text">לא ניתן להגיע ל־API. בדוק שהקונטיינרים רצים.</span>';
  }
}

applyConfig();
loadSystem({ registerVisit: true });
$('refresh').addEventListener('click', () => loadSystem());
