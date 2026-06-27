// LetOption — Auth helper
// Handles: checking current session, updating nav UI (Book Your Stay vs
// My Account), and sign-out. Include this on every page after
// supabase-client.js.

function ensureLoginLink(navActions) {
  if (navActions.querySelector('.nav-login-link, .nav-account-link')) return;
  const loginLink = document.createElement('a');
  loginLink.className = 'btn ghost nav-login-link';
  loginLink.href = 'login.html';
  loginLink.textContent = 'Log in';
  loginLink.style.marginRight = '4px';
  navActions.prepend(loginLink);
}

async function showAccountLink(navActions, session) {
  const bookBtn = navActions.querySelector('a[href="apartments.html"], a[href="register.html"]');
  const existingLogin = navActions.querySelector('.nav-login-link');
  if (existingLogin) existingLogin.remove();
  if (navActions.querySelector('.nav-account-link')) return;

  let href = 'account.html';
  try {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    if (profile && profile.role === 'landlord') {
      href = 'landlord-dashboard.html';
    }
  } catch (err) {
    console.warn('LetOption auth: could not determine role, defaulting to account.html', err);
  }

  const accountLink = document.createElement('a');
  accountLink.className = 'btn nav-account-link';
  accountLink.href = href;
  accountLink.textContent = 'My Account';
  if (bookBtn) {
    bookBtn.replaceWith(accountLink);
  } else {
    navActions.prepend(accountLink);
  }
}

async function updateNavForAuth() {
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;

  // Show "Log in" immediately — don't wait on the async session check.
  // If Supabase is slow, missing, or errors out, the link is still there.
  ensureLoginLink(navActions);

  try {
    if (typeof supabase === 'undefined') {
      console.warn('LetOption auth: Supabase client not loaded — login link shown, account state unknown.');
      return;
    }
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('LetOption auth: getSession error', error);
      return;
    }
    if (session) {
      await showAccountLink(navActions, session);
    }
  } catch (err) {
    console.warn('LetOption auth: updateNavForAuth failed', err);
    // Log in link is already showing from ensureLoginLink() above — fail safe.
  }
}

async function signOut() {
  await supabase.auth.signOut();
  window.location.href = 'index.html';
}

// Require login on pages like account.html — redirect to login if no session
async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
    return null;
  }
  return session;
}

document.addEventListener('DOMContentLoaded', updateNavForAuth);
