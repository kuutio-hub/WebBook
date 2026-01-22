
import { renderLibrary } from './views/library.js';
import { renderReader } from './views/reader.js';
import { renderPdfReader } from './views/pdfReader.js';
import { initTheme } from './services/themeService.js';

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
    if (state.selectedBook.type === 'pdf') {
        root.appendChild(renderPdfReader(state.selectedBook));
    } else {
        root.appendChild(renderReader(state.selectedBook));
    }
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

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  render();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
        if (registration.installing) {
            registration.installing.addEventListener('statechange', (e) => {
                if(e.target.state === 'installed') {
                    const event = new CustomEvent('showToast', { detail: { message: 'Az alkalmazás telepítve lett, már offline is működik!' }});
                    window.dispatchEvent(event);
                }
            });
        }
      }).catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }
});
