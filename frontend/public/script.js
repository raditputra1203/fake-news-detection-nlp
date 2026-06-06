/**
 * FakeGuard AI — script.js
 * Fake News Detection Using DistilBERT
 * Bina Nusantara University · Computer Science
 *
 * This file handles:
 *   1. Multi-page SPA navigation
 *   2. Navbar scroll behavior & mobile menu
 *   3. News analysis flow (with simulated API — see TODO markers)
 *   4. Character counter & textarea interaction
 *   5. Back-to-top button
 *
 * ─────────────────────────────────────────────
 * BACKEND INTEGRATION GUIDE
 * ─────────────────────────────────────────────
 * When the backend (POST /predict) is ready:
 *   1. Search for all TODO comments below.
 *   2. Replace the simulatePrediction() call inside analyzeArticle()
 *      with a real fetch() call to your API endpoint.
 *   3. The expected response format is:
 *        { "prediction": "Legitimate" | "Fake", "confidence": <number 0-100> }
 * ─────────────────────────────────────────────
 */

'use strict';

/* ─────────────────────────────────────────────
   1. PAGE NAVIGATION
───────────────────────────────────────────── */

/**
 * Shows the specified page and hides all others.
 * Also updates navbar active state and scrolls to top.
 * @param {'home' | 'detect' | 'about'} pageId
 */
function showPage(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Show target page
  const target = document.getElementById('page-' + pageId);
  if (target) target.classList.add('active');

  // Update nav link active state
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageId);
  });

  // Close mobile menu if open
  closeMobileMenu();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ─────────────────────────────────────────────
   2. NAVBAR SCROLL BEHAVIOR & MOBILE MENU
───────────────────────────────────────────── */

const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

// Add scrolled class for shadow on scroll
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Back-to-top button visibility
  const backBtn = document.getElementById('backToTop');
  if (window.scrollY > 400) {
    backBtn.classList.add('visible');
  } else {
    backBtn.classList.remove('visible');
  }
});

// Mobile hamburger toggle
if (hamburger) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });
}

function closeMobileMenu() {
  navLinks.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) {
    closeMobileMenu();
  }
});

/* ─────────────────────────────────────────────
   3. TEXTAREA: CHARACTER COUNTER & CLEAR
───────────────────────────────────────────── */

const newsInput  = document.getElementById('newsInput');
const charCount  = document.getElementById('charCount');

if (newsInput) {
  newsInput.addEventListener('input', () => {
    const len = newsInput.value.length;
    charCount.textContent = `${len.toLocaleString()} character${len !== 1 ? 's' : ''}`;
  });
}

function clearInput() {
  newsInput.value = '';
  charCount.textContent = '0 characters';
  newsInput.focus();
  hideAllResults();
  showElement('resultIdle');
}

/* ─────────────────────────────────────────────
   4. ANALYSIS FLOW
───────────────────────────────────────────── */

/**
 * Main entry point called when "Analyze News Article" button is clicked.
 * Validates input, shows loading state, then calls the prediction function.
 */
async function analyzeArticle() {
  const text = newsInput.value.trim();

  // Basic validation
  if (!text) {
    shakeTextarea();
    showToast('Please paste a news article before analyzing.', 'warn');
    return;
  }
  if (text.split(/\s+/).length < 20) {
    showToast('Please enter a longer article (at least 20 words).', 'warn');
    return;
  }

  // Switch to loading state
  hideAllResults();
  showElement('resultLoading');
  setAnalyzeButtonState(true);

  try {
    // ─────────────────────────────────────────────────────────────────
    // TODO: Replace simulatePrediction() with a real API request.
    //
    // Example backend call (uncomment and adjust when backend is ready):
    //
    // const response = await fetch('http://localhost:5000/predict', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ article: text })
    // });
    //
    // if (!response.ok) throw new Error(`Server error: ${response.status}`);
    //
    // const result = await response.json();
    // // Expected: { "prediction": "Legitimate" | "Fake", "confidence": 96.2 }
    // displayResult(result.prediction, result.confidence);
    //
    // ─────────────────────────────────────────────────────────────────

    // TEMPORARY: Simulated frontend-only prediction (remove when backend is ready)
    const result = await simulatePrediction(text);
    displayResult(result.prediction, result.confidence);

  } catch (error) {
    console.error('Analysis error:', error);
    hideAllResults();
    showElement('resultIdle');
    showToast('Analysis failed. Please try again.', 'error');
  } finally {
    setAnalyzeButtonState(false);
  }
}

/**
 * TEMPORARY SIMULATION FUNCTION
 * Mimics an API call with artificial delay and random result.
 * Remove or comment this out once the real backend is integrated.
 *
 * @param {string} text - The article text
 * @returns {Promise<{prediction: string, confidence: number}>}
 *
 * TODO: DELETE this function once backend is integrated.
 */
function simulatePrediction(text) {
  return new Promise((resolve) => {
    // Simulate network latency (1.5–2.5 seconds)
    const delay = 1500 + Math.random() * 1000;

    setTimeout(() => {
      // Dummy heuristic: articles with all-caps words or certain keywords
      // skew toward fake — purely illustrative, not a real model.
      const fakeSignals = ['shocking', 'exclusive', 'breaking', 'banned', 'secret', 'they don\'t want', 'mainstream media', 'exposed'];
      const lowerText   = text.toLowerCase();
      const hasFakeSignal = fakeSignals.some(w => lowerText.includes(w));
      const allCapsRatio  = (text.match(/\b[A-Z]{4,}\b/g) || []).length / (text.split(/\s+/).length || 1);

      const isFake = hasFakeSignal || allCapsRatio > 0.05 || Math.random() < 0.35;

      resolve({
        prediction: isFake ? 'Fake' : 'Legitimate',
        // Confidence between 78% and 98%
        confidence: parseFloat((78 + Math.random() * 20).toFixed(1))
      });
    }, delay);
  });
}

/**
 * Displays the prediction result in the UI.
 * @param {'Legitimate' | 'Fake'} prediction
 * @param {number} confidence - 0 to 100
 */
function displayResult(prediction, confidence) {
  hideAllResults();

  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const confidenceStr = `${confidence}%`;
  const barWidth      = `${confidence}%`;

  if (prediction === 'Legitimate') {
    document.getElementById('legitScore').textContent = confidenceStr;
    document.getElementById('legitBar').style.setProperty('--w', barWidth);
    document.getElementById('legitTime').textContent  = timestamp;
    showElement('resultLegit');
  } else {
    document.getElementById('fakeScore').textContent = confidenceStr;
    document.getElementById('fakeBar').style.setProperty('--w', barWidth);
    document.getElementById('fakeTime').textContent  = timestamp;
    showElement('resultFake');
  }
}

/* ─────────────────────────────────────────────
   5. UI HELPER FUNCTIONS
───────────────────────────────────────────── */

function showElement(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = '';
}

function hideAllResults() {
  ['resultIdle', 'resultLoading', 'resultLegit', 'resultFake'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

function setAnalyzeButtonState(isLoading) {
  const btn = document.getElementById('analyzeBtn');
  if (!btn) return;
  btn.disabled  = isLoading;
  btn.style.opacity = isLoading ? '.7' : '1';
  btn.style.cursor  = isLoading ? 'not-allowed' : 'pointer';
}

function shakeTextarea() {
  if (!newsInput) return;
  newsInput.style.animation = 'none';
  newsInput.getBoundingClientRect(); // force reflow
  newsInput.style.animation = 'shake .4s ease';
  setTimeout(() => { newsInput.style.animation = ''; }, 400);
}

/**
 * Minimal toast notification.
 * @param {string} message
 * @param {'warn' | 'error' | 'info'} type
 */
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  const colors = { warn: '#d97706', error: '#dc2626', info: '#1e4fa8' };
  Object.assign(toast.style, {
    position:     'fixed',
    bottom:       '80px',
    left:         '50%',
    transform:    'translateX(-50%)',
    background:   colors[type] || colors.info,
    color:        '#fff',
    padding:      '12px 22px',
    borderRadius: '10px',
    fontSize:     '.875rem',
    fontWeight:   '600',
    fontFamily:   'var(--font-sans)',
    boxShadow:    '0 8px 24px rgba(0,0,0,.2)',
    zIndex:       '9999',
    whiteSpace:   'nowrap',
    transition:   'opacity .3s',
  });

  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; }, 2500);
  setTimeout(() => { toast.remove(); }, 2800);
}

/* ─────────────────────────────────────────────
   6. BACK TO TOP
───────────────────────────────────────────── */

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ─────────────────────────────────────────────
   7. CSS ANIMATION: SHAKE (injected)
───────────────────────────────────────────── */

const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
@keyframes shake {
  0%,100% { transform: translateX(0); }
  20%      { transform: translateX(-6px); }
  40%      { transform: translateX(6px); }
  60%      { transform: translateX(-4px); }
  80%      { transform: translateX(4px); }
}`;
document.head.appendChild(shakeStyle);

/* ─────────────────────────────────────────────
   8. INIT: show home page on load
───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  showPage('home');
});
