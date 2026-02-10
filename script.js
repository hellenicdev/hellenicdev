/* =========================
   Google Analytics config
   ========================= */
window.dataLayer = window.dataLayer || [];
function gtag(){ dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-9FWQFZME3Z');


/* =========================
   Logo click thank-you
   ========================= */
function showThankYou() {
  const thanks = document.getElementById('hidden-thanks');
  if (!thanks) return;

  thanks.style.display = 'block';
  thanks.scrollIntoView({ behavior: 'smooth', block: 'center' });
}


/* =========================
   reCAPTCHA callback
   ========================= */
function showForm() {
  const form = document.getElementById('form-container');
  if (!form) return;

  form.style.display = 'block';
  form.scrollIntoView({ behavior: 'smooth' });
}


/* =========================
   Last-updated checker
   ========================= */
document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.last-updated[data-meta]');

  items.forEach(async el => {
    const url = el.getAttribute('data-meta');
    if (!url) return;

    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Fetch failed');

      const data = await res.json();
      if (data.lastUpdated) {
        el.textContent = `Last updated: ${data.lastUpdated}`;
      } else {
        el.textContent = 'Update info unavailable';
      }
    } catch {
      el.textContent = 'Could not load update info';
    }
  });
});


/* =========================
   Popup ad (if exists)
   ========================= */
(function () {
  const popup = document.getElementById('popup-ad');
  if (!popup) return;

  // show once per session
  if (sessionStorage.getItem('popupShown')) return;

  setTimeout(() => {
    popup.style.display = 'block';
    sessionStorage.setItem('popupShown', 'true');
  }, 8000);
})();
/* HELLO42 */

/* =========================
   Easter egg (console only)
   ========================= */
console.log(
  '%cHellenicDev',
  'color:#3fa9f5;font-size:20px;font-weight:bold;'
);
// console.log('Build. Break. Learn. Repeat.');
console.log("PYTHON1");
