
import { getSettings, saveSettings, getProgress, saveProgress } from '../services/dbService.js';
import { hyphenate } from '../services/hyphenationService.js';
import { renderReaderControls } from './readerControls.js';
import { ICONS } from './icons.js';

// ePub is loaded from CDN

export function renderReader(book) {
  const container = document.createElement('div');
  container.className = "h-screen w-screen flex flex-col relative";
  container.lang = "hu";
  
  let settings, rendition, epubBook;
  
  container.innerHTML = `
    <div id="loader" class="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
      ${ICONS.spinner}
    </div>
    <header id="reader-header" class="flex justify-between items-center p-2 shadow-md z-20">
       <button id="close-reader-btn" class="p-2 rounded-full hover:bg-gray-500/20 transition-colors">
          ${ICONS.arrowLeft}
      </button>
      <div class="text-center truncate px-4">
          <h1 class="font-semibold text-lg">${book.title}</h1>
          <h2 class="text-sm opacity-80">${book.author}</h2>
      </div>
      <div>
          <button id="fullscreen-btn" class="p-2 rounded-full hover:bg-gray-500/20 transition-colors mr-2">
              ${ICONS.fullscreen}
          </button>
          <button id="settings-btn" class="p-2 rounded-full hover:bg-gray-500/20 transition-colors">
              ${ICONS.settings}
          </button>
      </div>
    </header>

    <div class="flex-grow relative overflow-hidden">
      <div id="viewer" class="w-full h-full custom-scrollbar opacity-0"></div>
      <div id="pagination-controls"></div>
    </div>
    <div id="controls-container"></div>
  `;

  const viewer = container.querySelector('#viewer');
  const loader = container.querySelector('#loader');
  const header = container.querySelector('#reader-header');
  const paginationControls = container.querySelector('#pagination-controls');
  const controlsContainer = container.querySelector('#controls-container');
  const fullscreenBtn = container.querySelector('#fullscreen-btn');

  const applyTheme = () => {
    if (!rendition || !settings) return;
    
    container.style.backgroundColor = settings.backgroundColor;
    header.style.color = settings.textColor;
    header.style.backgroundColor = settings.backgroundColor;

    rendition.themes.register('custom', {
      'body': {
        'background': `${settings.backgroundColor} ${settings.backgroundPattern}`,
        'color': settings.textColor,
        'font-family': settings.fontFamily,
        'font-size': `${settings.fontSize}rem !important`,
        'line-height': `${settings.lineHeight} !important`,
        'letter-spacing': `${settings.letterSpacing}em !important`,
        'text-align': `${settings.textAlign} !important`,
        'padding': '1rem 2rem',
        'word-wrap': 'break-word',
      },
       'a': {
         'color': 'inherit !important',
         'text-decoration': 'underline !important',
       },
       'p': {'margin-bottom': '1em'},
       'img': {
        'max-width': '100%',
        'height': 'auto !important',
        'display': 'block',
        'margin': '1em auto',
      },
    });
    rendition.themes.select('custom');
  };
  
  const handleSettingsChange = async (newSettings) => {
    const isViewModeChanging = newSettings.viewMode && newSettings.viewMode !== settings.viewMode;
    settings = { ...settings, ...newSettings };
    await saveSettings(settings);
    
    if (isViewModeChanging) {
      // Re-render the whole reader view
      window.dispatchEvent(new CustomEvent('openBook', { detail: { book } }));
    } else {
      applyTheme();
    }
  };

  const initReader = async () => {
    settings = await getSettings();
    container.style.backgroundColor = settings.backgroundColor;
    header.style.color = settings.textColor;
    
    epubBook = ePub(book.file);
    rendition = epubBook.renderTo(viewer, {
        width: "100%",
        height: "100%",
        flow: settings.viewMode === 'scroll' ? 'scrolled-doc' : 'paginated',
        manager: settings.viewMode === 'scroll' ? 'continuous' : 'default',
    });
    
    rendition.hooks.content.register((contents) => {
      contents.document.body.lang = "hu";
      hyphenate(contents.document.body);
    });

    const storedCfi = await getProgress(book.id);
    rendition.display(storedCfi || undefined);

    rendition.on('relocated', (location) => {
      saveProgress(book.id, location.start.cfi);
    });
    
    await epubBook.ready;
    
    applyTheme();
    loader.style.display = 'none';
    viewer.classList.remove('opacity-0');

    const toc = epubBook.navigation.toc;
    controlsContainer.appendChild(renderReaderControls({
        settings,
        onSettingsChange: handleSettingsChange,
        toc,
        onTocSelect: (href) => rendition.display(href),
    }));

    if (settings.viewMode === 'paginated') {
      paginationControls.innerHTML = `
        <button id="prev-btn" class="absolute left-0 top-0 h-full w-1/5 z-10" aria-label="Previous page"></button>
        <button id="next-btn" class="absolute right-0 top-0 h-full w-1/5 z-10" aria-label="Next page"></button>
      `;
      container.querySelector('#prev-btn').addEventListener('click', () => rendition.prev());
      container.querySelector('#next-btn').addEventListener('click', () => rendition.next());
    }
  };
  
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        fullscreenBtn.innerHTML = ICONS.fullscreenExit;
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            fullscreenBtn.innerHTML = ICONS.fullscreen;
        }
    }
  };

  document.addEventListener('fullscreenchange', () => {
    fullscreenBtn.innerHTML = document.fullscreenElement ? ICONS.fullscreenExit : ICONS.fullscreen;
  });

  container.querySelector('#close-reader-btn').addEventListener('click', () => {
    epubBook?.destroy();
    window.dispatchEvent(new CustomEvent('closeReader'));
  });
  
  container.querySelector('#settings-btn').addEventListener('click', () => {
    const controlsPanel = container.querySelector('#controls-panel');
    if (controlsPanel) {
      controlsPanel.classList.toggle('hidden');
    }
  });

  fullscreenBtn.addEventListener('click', toggleFullScreen);
  
  initReader();

  return container;
}
