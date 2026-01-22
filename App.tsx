
import React, { useState, useCallback } from 'react';
import { LibraryView } from './components/LibraryView';
import { ReaderView } from './components/ReaderView';
import type { BookRecord } from './types';

type View = 'library' | 'reader';

const App: React.FC = () => {
  const [view, setView] = useState<View>('library');
  const [selectedBook, setSelectedBook] = useState<BookRecord | null>(null);

  const handleOpenBook = useCallback((book: BookRecord) => {
    setSelectedBook(book);
    setView('reader');
  }, []);

  const handleCloseReader = useCallback(() => {
    setSelectedBook(null);
    setView('library');
  }, []);

  return (
    <div className="min-h-screen font-sans">
      {view === 'library' && <LibraryView onOpenBook={handleOpenBook} />}
      {view === 'reader' && selectedBook && <ReaderView book={selectedBook} onClose={handleCloseReader} />}
    </div>
  );
};

export default App;
