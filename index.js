
import { renderLibrary } from './views/library.js';
import { renderReader } from './views/reader.js';
import { APP_NAME, APP_VERSION } from './constants.js';

const root = document.getElementById('root');

const state = {
  currentView: 'library', // 'library' or 'reader'
  selectedBook: null,
};

function render() {
  // Clear previous content
  while (root.firstChild) {
    root.removeChild(root.firstChild);
  }

  if (state.currentView === 'library') {
    root.appendChild(renderLibrary());
  } else if (state.currentView === 'reader' && state.selectedBook) {
    root.appendChild(renderReader(state.selectedBook));
  }
}

// Event Listeners for navigation
window.addEventListener('openBook', (e) => {
  state.currentView = 'reader';
  state.selectedBook = e.detail.book;
  render();
});

window.addEventListener('closeReader', () => {
  state.currentView = 'library';
  state.selectedBook = null;
  render();
});

function initFooter() {
    const footerText = document.getElementById('footer-text');
    if(footerText) {
        const currentYear = new Date().getFullYear();
        footerText.textContent = `© ${currentYear} ${APP_NAME} - Verzió: ${APP_VERSION}`;
    }
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  render();
  initFooter();
});
