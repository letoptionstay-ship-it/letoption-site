// LetOption — Booking form handler
// Wires a booking form (data-booking-request) to insert a real row
// into the bookings table via the create_booking() database function.
// Requires the guest to be signed in — redirects to login if not.

function attachBookingForm(formEl, propertyName) {
  if (!formEl) return;

  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = formEl.querySelector('button[type="submit"], button:not([type])');
    const originalLabel = submitBtn ? submitBtn.textContent : '';

    try {
      // Must be signed in to book
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        showBookingError(formEl, sessionError.message);
        return;
      }
      if (!sessionData || !sessionData.session) {
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
        return;
      }

      const checkin = formEl.querySelector('[name="checkin"]').value;
      const checkout = formEl.querySelector('[name="checkout"]').value;
      const guestsRaw = formEl.querySelector('[name="guests"]').value;
      const guests = parseInt(guestsRaw, 10) || 1;

      if (!checkin || !checkout) {
        showBookingError(formEl, 'Please choose both a check-in and check-out date.');
        return;
      }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting…'; }

      const { data, error } = await supabase.rpc('create_booking', {
        p_property_name: propertyName,
        p_check_in: checkin,
        p_check_out: checkout,
        p_guests: guests
      });

      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }

      if (error) {
        showBookingError(formEl, error.message || "We couldn't submit that booking request.");
        return;
      }

      const total = data && data.total_price ? Number(data.total_price).toFixed(2) : null;
      formEl.outerHTML = `<div class="booking-card"><h3>Request sent</h3><p class="lead">Your booking request${total ? ` for £${total} total` : ''} has been submitted. We'll confirm availability and send payment details by email shortly. No payment has been taken yet.</p><a class="btn" href="account.html" style="margin-top:14px;display:inline-block">View My Bookings</a></div>`;
    } catch (err) {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
      console.error('LetOption booking error:', err);
      showBookingError(formEl, 'Something went wrong submitting your booking. Please check your connection and try again, or email hello@letoption.co.uk.');
    }
  });
}

function showBookingError(formEl, message) {
  let note = formEl.querySelector('.form-error-note');
  if (!note) {
    note = document.createElement('p');
    note.className = 'form-error-note';
    note.style.color = '#b3261e';
    note.style.fontSize = '14px';
    note.style.marginTop = '14px';
    formEl.appendChild(note);
  }
  note.textContent = message;
}
