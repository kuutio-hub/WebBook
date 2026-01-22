
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { BookRecord, ReaderSettings } from '../types';
import { getSettings, saveSettings, getProgress, saveProgress } from '../services/dbService';
import { ReaderControls } from './ReaderControls';
import { Icon } from './Icon';

declare const ePub: any;

interface ReaderViewProps {
  book: BookRecord;
  onClose: () => void;
}

export const ReaderView: React.FC<ReaderViewProps> = ({ book, onClose }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<any>(null);
  const bookRef = useRef<any>(null);
  const [settings, setSettings] = useState<ReaderSettings | null>(null);
  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [toc, setToc] = useState<any[]>([]);
  const isFullScreen = document.fullscreenElement !== null;

  const handleSettingsChange = useCallback(async (newSettings: Partial<ReaderSettings>) => {
    if (!settings) return;
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    await saveSettings(updatedSettings);
  }, [settings]);

  const applyTheme = useCallback(() => {
    const rendition = renditionRef.current;
    if (!rendition || !settings) return;

    rendition.themes.register('custom', {
      'body': {
        'background': `${settings.backgroundColor} ${settings.backgroundPattern}`,
        'color': settings.textColor,
        'font-family': settings.fontFamily,
        'font-size': `${settings.fontSize}rem !important`,
        'line-height': `${settings.lineHeight} !important`,
        'letter-spacing': `${settings.letterSpacing}em !important`,
        'text-align': `${settings.textAlign} !important`,
        'padding': '0 2rem',
        'hyphens': 'auto',
      },
       'a': {
         'color': 'inherit !important',
         'text-decoration': 'underline !important',
       },
       'p': {
        'margin-bottom': '1em',
       }
    });
    rendition.themes.select('custom');
  }, [settings]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      const storedSettings = await getSettings();
      setSettings(storedSettings);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!viewerRef.current || !book || !settings) return;

    const epubBook = ePub(book.file);
    bookRef.current = epubBook;
    
    const rendition = epubBook.renderTo(viewerRef.current, {
        width: "100%",
        height: "100%",
        flow: settings.viewMode === 'scroll' ? 'scrolled-doc' : 'paginated',
        manager: settings.viewMode === 'scroll' ? 'continuous' : 'default',
    });
    renditionRef.current = rendition;

    epubBook.ready.then(async () => {
      setToc(epubBook.navigation.toc);
      const storedCfi = await getProgress(book.id);
      rendition.display(storedCfi || undefined);
      applyTheme();
      setIsReady(true);
    });

    rendition.on('relocated', (location: any) => {
      saveProgress(book.id, location.start.cfi);
      setCurrentLocation(location);
    });

    return () => {
        epubBook.destroy();
        renditionRef.current = null;
        bookRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book, settings?.viewMode]);

  useEffect(() => {
    applyTheme();
  }, [settings, applyTheme]);

  const goPrev = () => renditionRef.current?.prev();
  const goNext = () => renditionRef.current?.next();
  const goToTocItem = (href: string) => renditionRef.current?.display(href);

  return (
    <div style={{ backgroundColor: settings?.backgroundColor }} className="h-screen w-screen flex flex-col relative" lang="hu">
      {!isReady && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <Icon name="spinner" className="w-12 h-12 animate-spin text-gray-600" />
        </div>
      )}
      <header className="flex justify-between items-center p-2 shadow-md z-20" style={{color: settings?.textColor, backgroundColor: settings?.backgroundColor}}>
         <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/20 transition-colors">
            <Icon name="arrowLeft" className="w-6 h-6"/>
        </button>
        <div className="text-center truncate px-4">
            <h1 className="font-semibold text-lg">{book.title}</h1>
            <h2 className="text-sm opacity-80">{book.author}</h2>
        </div>
        <div>
            <button onClick={toggleFullScreen} className="p-2 rounded-full hover:bg-gray-500/20 transition-colors mr-2">
                <Icon name={isFullScreen ? "fullscreenExit" : "fullscreen"} className="w-6 h-6"/>
            </button>
            <button onClick={() => setIsControlsVisible(v => !v)} className="p-2 rounded-full hover:bg-gray-500/20 transition-colors">
                <Icon name="settings" className="w-6 h-6"/>
            </button>
        </div>
      </header>

      <div className="flex-grow relative">
        <div ref={viewerRef} className={`w-full h-full custom-scrollbar ${isReady ? 'opacity-100' : 'opacity-0'}`} />
        {settings?.viewMode === 'paginated' && isReady && (
            <>
            <button onClick={goPrev} className="absolute left-0 top-0 h-full w-1/5 z-10" aria-label="Previous page"></button>
            <button onClick={goNext} className="absolute right-0 top-0 h-full w-1/5 z-10" aria-label="Next page"></button>
            </>
        )}
      </div>

      <ReaderControls 
        isVisible={isControlsVisible}
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onClose={() => setIsControlsVisible(false)}
        toc={toc}
        onTocSelect={goToTocItem}
      />
    </div>
  );
};
