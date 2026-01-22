
import { getBooks, addBook, deleteBook } from '../services/dbService.js';
import { extractMetadata } from '../services/epubService.js';
import { renderBookDetailsModal } from './bookDetails.js';
import { ICONS } from './icons.js';

export function renderLibrary() {
  const container = document.createElement('div');
  container.className = 'min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8';
  container.innerHTML = `
    <header class="text-center mb-8">
      <h1 class="text-4xl sm:text-5xl font-bold text-gray-800 font-serif">Könyvtár</h1>
      <p class="text-lg text-gray-600 mt-2">Tölts fel egy új könyvet, vagy folytasd az olvasást.</p>
    </header>
    <main>
      <div id="book-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 sm:gap-6">
        <div class="text-center text-gray-500 col-span-full">Könyvek betöltése...</div>
      </div>
    </main>
    <div id="modal-container"></div>
  `;

  const bookGrid = container.querySelector('#book-grid');
  const modalContainer = container.querySelector('#modal-container');
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.epub';
  fileInput.className = 'hidden';

  const loadBooks = async () => {
    bookGrid.innerHTML = '<div class="text-center text-gray-500 col-span-full">Könyvek betöltése...</div>';
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
    
    const uploadTile = bookGrid.querySelector('#upload-tile-content');
    if (uploadTile) {
      uploadTile.innerHTML = `
        ${ICONS.spinner}
        <p class="mt-2 text-sm text-gray-600">Feltöltés...</p>
      `;
    }

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
    bookGrid.innerHTML = ''; // Clear existing
    books.forEach(book => {
      const bookEl = document.createElement('div');
      bookEl.className = "group relative cursor-pointer aspect-[2/3] transition-transform duration-300 hover:scale-105";
      bookEl.innerHTML = `
        <img src="${book.coverUrl || 'https://picsum.photos/400/600?grayscale'}" alt="${book.title}" class="w-full h-full object-cover rounded-lg shadow-lg" />
        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 rounded-lg flex flex-col justify-end p-3 text-white">
          <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 class="font-bold text-sm leading-tight">${book.title}</h3>
            <p class="text-xs text-gray-300">${book.author}</p>
          </div>
        </div>
        <button data-action="delete" class="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
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
    
    // Add upload tile
    const uploadTile = document.createElement('div');
    uploadTile.className = "flex flex-col items-center justify-center aspect-[2/3] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 hover:border-indigo-500 transition-colors duration-300";
    uploadTile.innerHTML = `<div id="upload-tile-content" class="text-center">${ICONS.upload}<p class="mt-2 text-sm text-center text-gray-500">Új könyv feltöltése</p></div>`;
    uploadTile.addEventListener('click', () => fileInput.click());
    bookGrid.appendChild(uploadTile);
  }
  
  function showDetailsModal(book) {
      modalContainer.innerHTML = ''; // Clear previous modal
      const modal = renderBookDetailsModal(book);
      modalContainer.appendChild(modal);
  }

  fileInput.addEventListener('change', handleFileChange);
  container.appendChild(fileInput);

  loadBooks();
  return container;
}
