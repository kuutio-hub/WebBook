
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
});
