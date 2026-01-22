
import { getBooks, addBook, deleteBook } from '../services/dbService.js';
import { extractMetadata } from '../services/epubService.js';
import { renderBookDetailsModal } from './bookDetails.js';
import { ICONS } from './icons.js';
import { toggleTheme } from '../services/themeService.js';
import { APP_NAME } from '../constants.js';

export function renderLibrary() {
  const container = document.createElement('div');
  container.className = 'min-h-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-200';
  
  container.innerHTML = `
    <header class="p-4 sm:p-6 flex justify-between items-center">
        <h1 class="text-xl font-bold font-serif">${APP_NAME}</h1>
        <div class="flex items-center space-x-2">
            <button id="theme-toggle-btn" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Téma váltása"></button>
            <button id="upload-btn-header" class="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors hidden sm:flex items-center">
                ${ICONS.upload}
                <span class="ml-2">Feltöltés</span>
            </button>
        </div>
    </header>

    <main class="px-4 sm:px-6 lg:px-8 pb-16">
        <section class="text-center py-16 sm:py-24">
            <h2 class="text-4xl sm:text-6xl font-bold font-serif text-gray-900 dark:text-white leading-tight">A Te Személyes Oázisod.</h2>
            <p class="mt-4 text-lg max-w-2xl mx-auto text-gray-600 dark:text-gray-300">Töltsd fel e-könyveidet és merülj el a zavartalan olvasás élményében, bárhol is jársz.</p>
            <button id="upload-btn-hero" class="mt-8 px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-transform hover:scale-105 shadow-lg">
                Könyv Feltöltése
            </button>
        </section>

        <section id="library-section" class="mt-8">
             <h3 class="text-2xl sm:text-3xl font-bold font-serif mb-6 text-gray-900 dark:text-white">A Te Könyvtárad</h3>
            <div id="book-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 sm:gap-6">
                <div class="text-center text-gray-500 col-span-full">Könyvek betöltése...</div>
            </div>
        </section>
    </main>
    <div id="modal-container"></div>
  `;

  const bookGrid = container.querySelector('#book-grid');
  const modalContainer = container.querySelector('#modal-container');
  const themeToggleBtn = container.querySelector('#theme-toggle-btn');
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.epub';
  fileInput.className = 'hidden';

  const updateThemeButton = (theme) => {
    if (theme === 'system') themeToggleBtn.innerHTML = ICONS.desktop;
    else if (theme === 'dark') themeToggleBtn.innerHTML = ICONS.moon;
    else themeToggleBtn.innerHTML = ICONS.sun;
  };

  const loadBooks = async () => {
    bookGrid.innerHTML = `<div class="text-center text-gray-500 dark:text-gray-400 col-span-full">${ICONS.spinner} Betöltés...</div>`;
    try {
      const books = await getBooks();
      renderBookGrid(books);
    } catch (error) {
      console.error("Failed to load books:", error);
      bookGrid.innerHTML = '<div class="text-center text-red-500 col-span-full">Hiba a könyvek betöltése közben.</div>';
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.name.toLowerCase().endsWith('.epub')) {
      alert('Kérlek, egy .epub kiterjesztésű fájlt válassz ki.');
      return;
    }
    
    const heroButton = container.querySelector('#upload-btn-hero');
    heroButton.disabled = true;
    heroButton.innerHTML = `<span class="flex items-center">${ICONS.spinner} Feldolgozás...</span>`;

    try {
      const fileBuffer = await file.arrayBuffer();
      const metadata = await extractMetadata(fileBuffer);
      
      await addBook({
        title: metadata.title,
        author: metadata.author,
        description: metadata.description,
        coverUrl: metadata.coverUrl,
        file: fileBuffer,
      });
      await loadBooks();
    } catch (error) {
      console.error("Error processing book:", error);
      alert('Hiba a könyv feldolgozása közben.');
    } finally {
        fileInput.value = ""; // Reset file input
        heroButton.disabled = false;
        heroButton.innerHTML = 'Könyv Feltöltése';
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt a könyvet?')) {
      try {
        await deleteBook(bookId);
        await loadBooks();
      } catch (error) {
        console.error("Failed to delete book:", error);
      }
    }
  };

  function renderBookGrid(books) {
    if (books.length === 0) {
        bookGrid.innerHTML = `<div class="col-span-full text-center py-12 px-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p class="text-lg font-medium text-gray-700 dark:text-gray-300">A könyvtárad még üres.</p>
            <p class="mt-2 text-gray-500 dark:text-gray-400">Kattints a 'Feltöltés' gombra az első könyved hozzáadásához!</p>
        </div>`;
    } else {
        bookGrid.innerHTML = ''; // Clear existing
        books.forEach(book => {
          const bookEl = document.createElement('div');
          bookEl.className = "group relative cursor-pointer aspect-[2/3] transition-transform duration-300 hover:scale-105";
          bookEl.innerHTML = `
            <img src="${book.coverUrl || 'https://picsum.photos/400/600?grayscale&blur=1'}" alt="${book.title}" class="w-full h-full object-cover rounded-lg shadow-lg" loading="lazy" />
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 rounded-lg flex flex-col justify-end p-3 text-white">
              <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 class="font-bold text-sm leading-tight">${book.title}</h3>
                <p class="text-xs text-gray-300">${book.author}</p>
              </div>
            </div>
            <button data-action="delete" class="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50" aria-label="Könyv törlése">
              ${ICONS.trash}
            </button>
          `;
          bookEl.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="delete"]')) {
              handleDeleteBook(book.id);
            } else {
              showDetailsModal(book);
            }
          });
          bookGrid.appendChild(bookEl);
        });
    }
  }
  
  function showDetailsModal(book) {
      modalContainer.innerHTML = ''; // Clear previous modal
      const modal = renderBookDetailsModal(book);
      modalContainer.appendChild(modal);
  }

  themeToggleBtn.addEventListener('click', () => {
    const newTheme = toggleTheme();
    updateThemeButton(newTheme);
  });
  
  container.querySelector('#upload-btn-header').addEventListener('click', () => fileInput.click());
  container.querySelector('#upload-btn-hero').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileChange);
  container.appendChild(fileInput);

  // Initial setup
  const currentTheme = localStorage.getItem('ebook-reader-theme') || 'system';
  updateThemeButton(currentTheme);
  loadBooks();

  return container;
}
