async function openSetlist() {
  const modal = document.getElementById('setlist-modal');
  const list = document.getElementById('setlist-content');

  modal.classList.add('open');

  try {
    const res = await fetch('setlist.txt', { cache: 'no-cache' });
    const text = await res.text();
    const songs = text.trim().split('\n').filter(l => l.trim());
    list.innerHTML = songs.map(s => `<li>${s}</li>`).join('');
  } catch {
    list.innerHTML = '<li>// could not load set list</li>';
  }
}

function closeSetlist(e) {
  if (!e || e.target === document.getElementById('setlist-modal')) {
    document.getElementById('setlist-modal').classList.remove('open');
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSetlist();
});

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === ',' && !inQuotes) { result.push(current); current = ''; }
    else current += ch;
  }
  result.push(current);
  return result.map(s => s.trim());
}

async function loadGigs() {
  const tbody = document.getElementById('gigs-tbody');
  const moreBtn = document.getElementById('shows-more-btn');
  try {
    const res = await fetch('gigs.csv', { cache: 'no-cache' });
    const text = await res.text();
    const lines = text.trim().split('\n').slice(1).filter(l => l.trim());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const gigs = lines
      .map(parseCSVLine)
      .map(([date, time, venue, city, cost, notes, pub]) => ({
        date, time, venue, city,
        cost: cost || '',
        notes: notes || '',
        public: pub && pub.toLowerCase() === 'true'
      }))
      .filter(g => g.public && new Date(g.date + 'T00:00:00') >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (gigs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="color:var(--dim);padding:1rem 0">// no upcoming shows — check back soon</td></tr>`;
      return;
    }

    tbody.innerHTML = gigs.map((g, i) => {
      const d = new Date(g.date + 'T00:00:00');
      const day = d.toLocaleDateString('en-AU', { weekday: 'short' });
      const dateStr = d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
      const extra = i >= 4 ? ' class="gig-extra"' : '';
      return `<tr${extra}>
        <td><span class="gig-day">${day}</span> ${dateStr}</td>
        <td class="col-time">${g.time || '—'}</td>
        <td>${g.venue}</td>
        <td>${g.city}</td>
        <td class="col-cost">${g.cost}</td>
        <td class="col-notes">${g.notes}</td>
      </tr>`;
    }).join('');

    const extra = Math.max(0, gigs.length - 4);
    if (extra > 0) {
      moreBtn.style.display = 'inline-block';
      moreBtn.textContent = `// ${extra} MORE SHOW${extra > 1 ? 'S' : ''}`;
    }
  } catch {
    tbody.innerHTML = `<tr><td colspan="6" style="color:var(--dim);padding:1rem 0">// could not load shows</td></tr>`;
  }
}

function expandShows() {
  document.querySelectorAll('.gig-extra').forEach(r => r.classList.remove('gig-extra'));
  document.getElementById('shows-more-btn').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', loadGigs);

async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const note = document.getElementById('form-note');
  const btn = form.querySelector('.submit-btn');

  btn.textContent = 'SENDING...';
  btn.disabled = true;
  note.textContent = '';

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      note.textContent = '// message received. we\'ll be in touch.';
      btn.textContent = 'TRANSMITTED';
      form.reset();
      setTimeout(() => {
        btn.textContent = 'TRANSMIT →';
        btn.disabled = false;
        note.textContent = '';
      }, 4000);
    } else {
      throw new Error('Server error');
    }
  } catch (err) {
    note.textContent = '// transmission failed. try again or email us directly.';
    btn.textContent = 'TRANSMIT →';
    btn.disabled = false;
  }
}
