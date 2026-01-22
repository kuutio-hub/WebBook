
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getBooks, addBook, deleteBook } from '../services/dbService';
import { extractMetadata } from '../services/epubService';
import type { BookRecord } from '../types';
import { Icon } from './Icon';

interface LibraryViewProps {
  onOpenBook: (book: BookRecord) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ onOpenBook }) => {
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedBooks = await getBooks();
      setBooks(storedBooks);
    } catch (error) {
      console.error("Failed to load books:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.name.toLowerCase().endsWith('.epub')) {
      alert('Kérlek, egy .epub kiterjesztésű fájlt válassz ki.');
      return;
    }
    setIsUploading(true);
    try {
      const fileBuffer = await file.arrayBuffer();
      const metadata = await extractMetadata(fileBuffer);
      
      await addBook({
        title: metadata.title,
        author: metadata.author,
        coverUrl: metadata.coverUrl,
        file: fileBuffer,
      });

      await loadBooks();
    } catch (error) {
      console.error("Error processing book:", error);
      alert('Hiba a könyv feldolgozása közben.');
    } finally {
      setIsUploading(false);
       if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteBook = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm('Biztosan törölni szeretnéd ezt a könyvet?')) {
      try {
        await deleteBook(id);
        await loadBooks();
      } catch (error) {
        console.error("Failed to delete book:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 font-serif">Könyvtár</h1>
        <p className="text-lg text-gray-600 mt-2">Tölts fel egy új könyvet, vagy folytasd az olvasást.</p>
      </header>
      
      <main>
        {isLoading ? (
          <div className="text-center text-gray-500">Könyvek betöltése...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 sm:gap-6">
            {books.map(book => (
              <div key={book.id} onClick={() => onOpenBook(book)} className="group relative cursor-pointer aspect-[2/3] transition-transform duration-300 hover:scale-105">
                <img src={book.coverUrl || 'https://picsum.photos/400/600?grayscale'} alt={book.title} className="w-full h-full object-cover rounded-lg shadow-lg" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 rounded-lg flex flex-col justify-end p-3 text-white">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="font-bold text-sm leading-tight">{book.title}</h3>
                    <p className="text-xs text-gray-300">{book.author}</p>
                  </div>
                </div>
                 <button onClick={(e) => handleDeleteBook(e, book.id)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
                    <Icon name="trash" className="w-4 h-4" />
                </button>
              </div>
            ))}
             <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center aspect-[2/3] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 hover:border-indigo-500 transition-colors duration-300"
              >
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".epub" className="hidden" disabled={isUploading} />
                {isUploading ? (
                    <>
                        <Icon name="spinner" className="w-8 h-8 text-indigo-500 animate-spin" />
                        <p className="mt-2 text-sm text-gray-600">Feltöltés...</p>
                    </>
                ) : (
                    <>
                        <Icon name="upload" className="w-8 h-8 text-gray-400" />
                        <p className="mt-2 text-sm text-center text-gray-500">Új könyv feltöltése</p>
                    </>
                )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
