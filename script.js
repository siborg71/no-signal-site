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
