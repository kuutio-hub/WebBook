
import { FONT_FAMILIES, COLOR_PALETTES, BACKGROUND_PATTERNS } from '../constants.js';
import { ICONS } from './icons.js';

export function renderReaderControls({ settings, onSettingsChange, toc, onTocSelect }) {
    const container = document.createElement('div');
    container.id = 'controls-panel';
    container.className = 'fixed inset-0 bg-black bg-opacity-50 z-30 hidden';

    let activeTab = 'display';

    const render = () => {
        container.innerHTML = `
            <div class="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-2xl flex flex-col" data-panel-content>
                <header class="p-4 border-b dark:border-gray-700 flex items-center justify-between">
                    <h3 class="text-xl font-semibold">Beállítások</h3>
                    <button data-action="close" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        ${ICONS.close}
                    </button>
                </header>
                
                <div class="border-b dark:border-gray-700">
                    <nav class="flex">
                        <button data-tab="display" class="flex-1 p-3 text-sm font-medium transition-colors ${activeTab === 'display' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}">Megjelenés</button>
                        <button data-tab="toc" class="flex-1 p-3 text-sm font-medium transition-colors ${activeTab === 'toc' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}">Tartalomjegyzék</button>
                    </nav>
                </div>

                <div class="flex-grow overflow-y-auto custom-scrollbar">
                    ${activeTab === 'display' ? renderDisplayTab() : renderTocTab()}
                </div>
            </div>
        `;
    };

    const renderDisplayTab = () => `
        <div class="p-4 space-y-6">
            <div>
                <label class="block text-sm font-medium mb-2">Betűméret</label>
                <div class="flex items-center space-x-4">
                    <span class="text-lg">A</span>
                    <input type="range" data-setting="fontSize" min="0.8" max="2.0" step="0.1" value="${settings.fontSize}" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/>
                    <span class="text-3xl">A</span>
                </div>
            </div>
            <div>
                <label for="font-family" class="block text-sm font-medium mb-2">Betűtípus</label>
                <select id="font-family" data-setting="fontFamily" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                    ${FONT_FAMILIES.map(font => `<option value="${font.value}" ${settings.fontFamily === font.value ? 'selected' : ''} style="font-family: ${font.value}">${font.name}</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium mb-2">Margók</label>
                <div class="space-y-3">
                    <div>
                        <label for="padding-x" class="text-xs text-gray-500">Vízszintes</label>
                        <input id="padding-x" type="range" data-setting="paddingX" min="0" max="8" step="0.25" value="${settings.paddingX}" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/>
                    </div>
                     <div>
                        <label for="padding-y" class="text-xs text-gray-500">Függőleges</label>
                        <input id="padding-y" type="range" data-setting="paddingY" min="0" max="8" step="0.25" value="${settings.paddingY}" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/>
                    </div>
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium mb-2">Igazítás</label>
                <div class="grid grid-cols-4 gap-2">
                    ${(['text-left', 'text-center', 'text-right', 'text-justify'].map(align => `
                        <button data-setting="textAlign" data-value="${align}" class="p-2 rounded-md border ${settings.textAlign === align ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}">
                            ${ICONS[align.replace('text-','')] || ''}
                        </button>
                    `).join(''))}
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium mb-2">Színséma</label>
                <div class="grid grid-cols-4 gap-2">
                    ${COLOR_PALETTES.map(palette => `
                        <button data-setting="colors" data-bg="${palette.bg}" data-text="${palette.text}" class="h-12 w-full rounded-md border-2 ${settings.backgroundColor === palette.bg ? 'border-indigo-500' : 'border-transparent'}" style="background-color: ${palette.bg}" title="${palette.name}"></button>
                    `).join('')}
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium mb-2">Háttérminta</label>
                <div class="grid grid-cols-4 gap-2">
                    ${BACKGROUND_PATTERNS.map(pattern => `
                        <button data-setting="backgroundPattern" data-value="${pattern.value}" class="h-12 w-full rounded-md border-2 pattern-preview ${settings.backgroundPattern === pattern.value ? 'border-indigo-500' : 'border-gray-300 dark:border-gray-600'}" style="background-color: ${settings.backgroundColor}; background-image: ${pattern.value}" title="${pattern.name}"></button>
                    `).join('')}
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium mb-2">Nézet</label>
                <div class="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                    <button data-setting="viewMode" data-value="scroll" class="flex-1 p-2 text-sm rounded-md transition-colors ${settings.viewMode === 'scroll' ? 'bg-white dark:bg-gray-900 shadow' : ''}">Görgetés</button>
                    <button data-setting="viewMode" data-value="paginated" class="flex-1 p-2 text-sm rounded-md transition-colors ${settings.viewMode === 'paginated' ? 'bg-white dark:bg-gray-900 shadow' : ''}">Lapozás</button>
                </div>
                <p class="text-xs text-gray-500 mt-2">A nézet váltásához újra be kell tölteni a könyvet. Nagy képernyőn a lapozás automatikus.</p>
            </div>
        </div>
    `;

    const renderTocTab = () => `
        <ul class="divide-y dark:divide-gray-700">
            ${toc.map((item, index) => `
                <li key="${index}">
                    <button data-href="${item.href}" class="w-full text-left p-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        ${item.label.trim()}
                    </button>
                </li>
            `).join('')}
        </ul>
    `;
    
    container.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action="close"], [data-tab], [data-setting], [data-href]');

        if (!target && e.target === container) {
            container.classList.add('hidden');
            return;
        }
        
        if (!target) return;
        
        e.stopPropagation();

        if (target.dataset.action === 'close') {
            container.classList.add('hidden');
        } else if (target.dataset.tab) {
            activeTab = target.dataset.tab;
            render();
        } else if (target.dataset.setting) {
            const { setting, value, bg, text } = target.dataset;
            let changes = {};
            switch(setting) {
                case 'textAlign':
                case 'viewMode':
                case 'backgroundPattern':
                    changes = { [setting]: value };
                    break;
                case 'colors':
                    changes = { backgroundColor: bg, textColor: text };
                    break;
            }
            onSettingsChange(changes);
        } else if (target.dataset.href) {
            onTocSelect(target.dataset.href);
            container.classList.add('hidden');
        }
    });

    container.addEventListener('input', (e) => {
        const target = e.target;
        const setting = target.dataset.setting;
        if(setting === 'fontSize' || setting === 'paddingX' || setting === 'paddingY') {
            onSettingsChange({ [setting]: parseFloat(target.value) });
        }
    });

    container.addEventListener('change', (e) => {
        const target = e.target;
        if(target.dataset.setting === 'fontFamily') {
            onSettingsChange({ fontFamily: target.value });
        }
    });

    render();
    return container;
}
