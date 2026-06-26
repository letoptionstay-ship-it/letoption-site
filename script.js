
// LetOption premium interactions
const upload = document.querySelector('[data-upload]');
const fileInput = document.querySelector('#photos');
const preview = document.querySelector('[data-preview]');
if (upload && fileInput && preview) {
  upload.addEventListener('click', () => fileInput.click());
  ['dragenter','dragover'].forEach(evt => upload.addEventListener(evt, e => { e.preventDefault(); upload.style.background = '#f4efe6'; }));
  ['dragleave','drop'].forEach(evt => upload.addEventListener(evt, e => { e.preventDefault(); upload.style.background = '#fbfaf7'; }));
  upload.addEventListener('drop', e => handleFiles(e.dataTransfer.files));
  fileInput.addEventListener('change', e => handleFiles(e.target.files));
  function handleFiles(files) {
    preview.innerHTML = '';
    [...files].slice(0, 12).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      preview.appendChild(img);
    });
  }
}

/* Demo alert handlers removed — real Netlify Forms submission logic now
   lives inline on each form via the shared submitNetlifyForm() helper below. */

// Real Netlify Forms submission helper.
// Netlify intercepts POSTs to "/" on its own domain once a matching
// static <form data-netlify="true"> with the same name attribute exists
// somewhere in the deployed HTML. Off-Netlify (e.g. local testing) this
// fetch will fail — we catch that and show a clear fallback message
// rather than pretending the submission succeeded.
function submitNetlifyForm(form, { onSuccess, onError } = {}) {
  const formData = new FormData(form);
  fetch('/', { method: 'POST', body: formData })
    .then(res => {
      if (res.ok) { onSuccess && onSuccess(); }
      else { onError && onError(); }
    })
    .catch(() => { onError && onError(); });
}

function attachNetlifyForm(formEl, { successHTML, fallbackMessage }) {
  if (!formEl) return;
  formEl.addEventListener('submit', e => {
    e.preventDefault();
    const submitBtn = formEl.querySelector('button[type="submit"], button:not([type])');
    const originalLabel = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
    submitNetlifyForm(formEl, {
      onSuccess: () => {
        if (successHTML) {
          formEl.outerHTML = successHTML;
        } else if (submitBtn) {
          submitBtn.textContent = 'Sent ✓';
        }
      },
      onError: () => {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
        let note = formEl.querySelector('.form-error-note');
        if (!note) {
          note = document.createElement('p');
          note.className = 'form-error-note';
          note.style.color = '#b3261e';
          note.style.fontSize = '14px';
          note.style.marginTop = '14px';
          formEl.appendChild(note);
        }
        note.textContent = fallbackMessage || "We couldn't send that — please try again, or email hello@letoption.co.uk directly.";
      },
    });
  });
}

// Wire the real lead-generating forms (contact + property registration)
attachNetlifyForm(document.querySelector('form[name="guest-enquiry"]'), {
  successHTML: '<div class="form-card"><h3>Thanks — your enquiry is in.</h3><p class="lead">A LetOption coordinator will get back to you shortly at the email address you provided.</p></div>',
});
attachNetlifyForm(document.querySelector('form[name="property-registration"]'), {
  successHTML: '<div class="wizard"><div class="wizard-panel active" style="padding:48px;text-align:center"><h3>Thanks — your property is in.</h3><p class="lead">A LetOption onboarding specialist will review your submission and follow up by email within two business days.</p></div></div>',
});
attachNetlifyForm(document.querySelector('form[name="newsletter"]'), {
  fallbackMessage: "We couldn't sign you up — please try again shortly.",
});

// Booking request forms on apartment detail pages (no real availability
// backend yet, so these are submitted as booking enquiries via Netlify
// Forms rather than instant confirmations).
document.querySelectorAll('form[data-booking-request]').forEach(form => {
  attachNetlifyForm(form, {
    successHTML: '<div class="booking-card"><h3>Request sent</h3><p class="lead">We\'ll confirm availability and send payment details by email shortly. No payment has been taken yet.</p></div>',
  });
});

const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => nav && nav.classList.toggle('scrolled', window.scrollY > 10));

const menu = document.querySelector('.menu');
if(menu){
  const drawer = document.createElement('div');
  drawer.className = 'mobile-drawer';
  drawer.innerHTML = '<a href="apartments.html">Homes</a><a href="services.html">Services</a><a href="landlords.html">For Landlords</a><a href="about.html">About Us</a><a href="contact.html">Contact</a>';
  document.body.appendChild(drawer);
  menu.addEventListener('click', () => drawer.classList.toggle('open'));
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting) entry.target.classList.add('visible');
  });
},{threshold:.12});
document.querySelectorAll('section,.features,.trust-row,.search-panel').forEach(el => {
  el.classList.add('reveal'); observer.observe(el);
});

document.querySelectorAll('.like-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    btn.classList.toggle('active');
    btn.textContent = btn.classList.contains('active') ? '♥' : '♡';
  });
});

// Property registration wizard
let currentStep = 0;
const steps = [...document.querySelectorAll('.wizard-step')];
const panels = [...document.querySelectorAll('.wizard-panel')];
function showStep(i){
  currentStep = Math.max(0, Math.min(i, panels.length-1));
  steps.forEach((s,idx)=>s.classList.toggle('active',idx===currentStep));
  panels.forEach((p,idx)=>p.classList.toggle('active',idx===currentStep));
}
document.querySelectorAll('[data-next]').forEach(btn=>btn.addEventListener('click',()=>showStep(currentStep+1)));
document.querySelectorAll('[data-prev]').forEach(btn=>btn.addEventListener('click',()=>showStep(currentStep-1)));
if(steps.length) showStep(0);

// Revenue estimator
const nightly = document.querySelector('#nightlyRate');
const occupancy = document.querySelector('#occupancy');
const monthly = document.querySelector('#monthlyRevenue');
const annual = document.querySelector('#annualRevenue');
const rateLabel = document.querySelector('#rateLabel');
const occLabel = document.querySelector('#occLabel');
function updateEstimator(){
  if(!nightly || !occupancy || !monthly || !annual) return;
  const rate = Number(nightly.value);
  const occ = Number(occupancy.value);
  const m = Math.round(rate * 30 * (occ/100));
  const a = m * 12;
  rateLabel.textContent = `£${rate}`;
  occLabel.textContent = `${occ}%`;
  monthly.textContent = `£${m.toLocaleString()}`;
  annual.textContent = `£${a.toLocaleString()}`;
}
[nightly, occupancy].forEach(el => el && el.addEventListener('input', updateEstimator));
updateEstimator();

// Booking search demo
const bookingSearch = document.querySelector('#bookingSearch');
if(bookingSearch){
  bookingSearch.addEventListener('submit', e => {
    e.preventDefault();
    const area = document.querySelector('#searchArea')?.value || 'London';
    alert(`Searching premium LetOption homes in ${area}. Connect this form to your booking engine when ready.`);
  });
}
