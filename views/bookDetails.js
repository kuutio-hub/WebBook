
import { ICONS } from './icons.js';

export function renderBookDetailsModal(book) {
  const modalWrapper = document.createElement('div');
  modalWrapper.className = "fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4";
  
  const isReadable = book.type === 'epub' || book.type === 'pdf';

  modalWrapper.innerHTML = `
    <div class="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden">
      <div class="w-full md:w-1/3 flex-shrink-0">
        <img src="${book.coverUrl || 'https://via.placeholder.com/400x600.png/2d3748/ffffff?text=Nincs+bor%C3%ADt%C3%B3'}" alt="${book.title}" class="w-full h-64 md:h-full object-cover bg-gray-700" />
      </div>
      <div class="flex flex-col p-6 overflow-y-auto custom-scrollbar">
        <div class="flex-grow">
          <h2 class="text-3xl font-bold font-serif ">${book.title}</h2>
          <h3 class="text-lg font-medium text-gray-600 dark:text-gray-400 mt-1 mb-4">${book.author}</h3>
          <div class="prose prose-sm dark:prose-invert max-w-none">
            ${book.description || '<p>Nincs elérhető leírás.</p>'}
          </div>
        </div>
        <div class="flex-shrink-0 flex flex-wrap items-center justify-end gap-2 mt-6">
          <button data-action="close" class="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            Bezárás
          </button>
          <button data-action="download" class="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center">
            ${ICONS.download}
            <span class="ml-2">Letöltés</span>
          </button>
          <button data-action="read" class="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed" ${!isReadable ? 'disabled' : ''} title="${!isReadable ? 'Ez a formátum jelenleg nem olvasható' : ''}">
            ${ICONS.bookOpen}
            <span class="ml-2">Olvasás</span>
          </button>
        </div>
      </div>
    </div>
  `;

  const closeModal = () => modalWrapper.remove();

  const handleDownload = () => {
    const mimeType = book.type === 'pdf' ? 'application/pdf' : 'application/epub+zip';
    const blob = new Blob([book.file], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${book.type}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  modalWrapper.addEventListener('click', (e) => {
    if (e.target === modalWrapper) {
      closeModal();
    }
  });

  modalWrapper.querySelector('[data-action="close"]').addEventListener('click', closeModal);
  modalWrapper.querySelector('[data-action="download"]').addEventListener('click', handleDownload);

  modalWrapper.querySelector('[data-action="read"]').addEventListener('click', () => {
    if(isReadable) {
        window.dispatchEvent(new CustomEvent('openBook', { detail: { book } }));
        closeModal();
    }
  });

  return modalWrapper;
}
