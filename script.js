function handleSubmit(e) {
  e.preventDefault();
  const note = document.getElementById('form-note');
  const btn = e.target.querySelector('.submit-btn');
  btn.textContent = 'SENDING...';
  btn.disabled = true;

  setTimeout(() => {
    note.textContent = '// message received. we\'ll be in touch.';
    btn.textContent = 'TRANSMITTED';
    e.target.reset();
    setTimeout(() => {
      btn.textContent = 'TRANSMIT →';
      btn.disabled = false;
      note.textContent = '';
    }, 4000);
  }, 1000);
}
