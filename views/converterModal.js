
import { ICONS } from './icons.js';

export function renderConverterModal(fileName) {
  const modalWrapper = document.createElement('div');
  modalWrapper.className = "fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4";
  
  modalWrapper.innerHTML = `
    <div class="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg shadow-2xl w-full max-w-lg overflow-hidden">
        <header class="p-4 border-b dark:border-gray-700">
            <h2 class="text-2xl font-bold font-serif">Formátum Konvertálás Szükséges</h2>
        </header>
        <div class="p-6">
            <p class="mb-4">A(z) <strong>${fileName}</strong> fájl MOBI vagy PRC formátumú, amelyet ez az olvasó közvetlenül nem tud megnyitni.</p>
            <p class="mb-6">A legjobb olvasási élmény érdekében kérlek, konvertáld át EPUB formátumba egy online eszköz segítségével. A konvertálás után töltsd fel az új EPUB fájlt.</p>
            <a href="https://cloudconvert.com/mobi-to-epub" target="_blank" rel="noopener noreferrer" class="w-full text-center block px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg">
                Online Konverter Megnyitása
            </a>
            <p class="text-xs text-gray-500 mt-2 text-center">Egy új ablakban nyílik meg a CloudConvert oldala.</p>
        </div>
         <footer class="p-4 bg-gray-50 dark:bg-gray-700/50 text-right">
            <button data-action="close" class="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Mégse</button>
        </footer>
    </div>
  `;

  const closeModal = () => modalWrapper.remove();
  
  modalWrapper.addEventListener('click', (e) => {
    if (e.target === modalWrapper || e.target.closest('[data-action="close"]')) {
      closeModal();
    }
  });

  return modalWrapper;
}
