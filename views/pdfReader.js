
import { getSettings, getProgress, saveProgress } from '../services/dbService.js';
import { ICONS } from './icons.js';

export function renderPdfReader(book) {
    const container = document.createElement('div');
    container.className = "h-screen w-screen flex flex-col relative bg-gray-200 dark:bg-gray-800";
    container.lang = "hu";
  
    let pdfDoc = null;
    let pageNum = 1;
    let pageRendering = false;
    let pageNumPending = null;
    let settings = {};
    const scale = 1.5;

    container.innerHTML = `
        <div id="loader" class="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
            ${ICONS.spinner} Betöltés...
        </div>
        <header class="flex justify-between items-center p-2 shadow-md z-20 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex-shrink-0">
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
            </div>
        </header>

        <main class="flex-grow relative overflow-auto custom-scrollbar flex items-center justify-center p-4">
            <canvas id="pdf-canvas" class="shadow-lg"></canvas>
        </main>
        
        <footer id="pdf-controls" class="flex-shrink-0 flex items-center justify-center p-2 bg-white dark:bg-gray-900 shadow-inner z-20">
            <button id="prev-page" class="p-2 rounded-full hover:bg-gray-500/20 transition-colors">${ICONS.arrowLeft}</button>
            <span id="page-num" class="mx-4 font-mono text-sm"></span>
            <button id="next-page" class="p-2 rounded-full hover:bg-gray-500/20 transition-colors">${ICONS.arrowLeft.replace('d="M10 19l-7-7m0 0l7-7m-7 7h18"', 'd="M14 5l7 7m0 0l-7 7m7-7H3"')}</button>
        </footer>
    `;
    
    const loader = container.querySelector('#loader');
    const canvas = container.querySelector('#pdf-canvas');
    const ctx = canvas.getContext('2d');
    const pageNumEl = container.querySelector('#page-num');
    const fullscreenBtn = container.querySelector('#fullscreen-btn');

    const renderPage = async (num) => {
        pageRendering = true;
        const page = await pdfDoc.getPage(num);
        const viewport = page.getViewport({ scale: scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = { canvasContext: ctx, viewport: viewport };
        const renderTask = page.render(renderContext);

        await renderTask.promise;
        pageRendering = false;
        pageNumEl.textContent = `${num} / ${pdfDoc.numPages}`;
        saveProgress(book.id, num);

        if (pageNumPending !== null) {
            renderPage(pageNumPending);
            pageNumPending = null;
        }
    };

    const queueRenderPage = (num) => {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            renderPage(num);
        }
    };

    const onPrevPage = () => {
        if (pageNum <= 1) return;
        pageNum--;
        queueRenderPage(pageNum);
    };

    const onNextPage = () => {
        if (pageNum >= pdfDoc.numPages) return;
        pageNum++;
        queueRenderPage(pageNum);
    };

    const handleKeydown = (e) => {
        if (!settings.enableKeyboardNav) return;
        if (e.key === 'ArrowLeft') onPrevPage();
        else if (e.key === 'ArrowRight') onNextPage();
    };
    
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else if (document.exitFullscreen) document.exitFullscreen();
    };

    const onFullScreenChange = () => {
        fullscreenBtn.innerHTML = document.fullscreenElement ? ICONS.fullscreenExit : ICONS.fullscreen;
    };
    
    const cleanup = () => {
        document.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('fullscreenchange', onFullScreenChange);
    };

    const init = async () => {
        settings = await getSettings();
        document.addEventListener('keydown', handleKeydown);
        document.addEventListener('fullscreenchange', onFullScreenChange);

        const loadingTask = pdfjsLib.getDocument({ data: book.file });
        pdfDoc = await loadingTask.promise;

        const storedPage = await getProgress(book.id);
        pageNum = typeof storedPage === 'number' && storedPage > 0 ? storedPage : 1;
        
        await renderPage(pageNum);
        loader.style.display = 'none';
    };

    container.querySelector('#prev-page').addEventListener('click', onPrevPage);
    container.querySelector('#next-page').addEventListener('click', onNextPage);
    container.querySelector('#close-reader-btn').addEventListener('click', () => {
        cleanup();
        window.dispatchEvent(new CustomEvent('closeReader'));
    });
    fullscreenBtn.addEventListener('click', toggleFullScreen);
    
    init();
    
    return container;
}
