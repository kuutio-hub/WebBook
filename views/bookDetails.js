
import { ICONS } from './icons.js';

export function renderBookDetailsModal(book) {
  const modalWrapper = document.createElement('div');
  modalWrapper.className = "fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4";
  
  modalWrapper.innerHTML = `
    <div class="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden">
      <div class="w-full md:w-1/3 flex-shrink-0">
        <img src="${book.coverUrl || 'https://picsum.photos/400/600?grayscale'}" alt="${book.title}" class="w-full h-64 md:h-full object-cover" />
      </div>
      <div class="flex flex-col p-6 overflow-y-auto custom-scrollbar">
        <div class="flex-grow">
          <h2 class="text-3xl font-bold font-serif text-gray-800">${book.title}</h2>
          <h3 class="text-lg font-medium text-gray-600 mt-1 mb-4">${book.author}</h3>
          <div class="prose prose-sm max-w-none text-gray-700">
            ${book.description || '<p>Nincs elérhető leírás.</p>'}
          </div>
        </div>
        <div class="flex-shrink-0 flex items-center justify-end space-x-4 mt-6">
          <button data-action="close" class="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
            Bezárás
          </button>
          <button data-action="read" class="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors flex items-center">
            ${ICONS.bookOpen}
            <span class="ml-2">Olvasás</span>
          </button>
        </div>
      </div>
    </div>
  `;

  const closeModal = () => modalWrapper.remove();
  
  modalWrapper.addEventListener('click', (e) => {
    if (e.target === modalWrapper) {
      closeModal();
    }
  });

  modalWrapper.querySelector('[data-action="close"]').addEventListener('click', closeModal);

  modalWrapper.querySelector('[data-action="read"]').addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('openBook', { detail: { book } }));
    closeModal();
  });

  return modalWrapper;
}
