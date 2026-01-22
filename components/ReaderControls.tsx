
import React, { useState } from 'react';
import type { ReaderSettings } from '../types';
import { FONT_FAMILIES, COLOR_PALETTES, BACKGROUND_PATTERNS } from '../constants';
import { Icon } from './Icon';

interface ReaderControlsProps {
  isVisible: boolean;
  settings: ReaderSettings | null;
  onSettingsChange: (newSettings: Partial<ReaderSettings>) => void;
  onClose: () => void;
  toc: any[];
  onTocSelect: (href: string) => void;
}

type Tab = 'display' | 'toc';

export const ReaderControls: React.FC<ReaderControlsProps> = ({ isVisible, settings, onSettingsChange, onClose, toc, onTocSelect }) => {
    const [activeTab, setActiveTab] = useState<Tab>('display');
    
    if (!isVisible || !settings) return null;

    const handleTocClick = (href: string) => {
        onTocSelect(href);
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={onClose}>
            <div 
                className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-2xl flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Beállítások</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        <Icon name="close" className="w-5 h-5" />
                    </button>
                </header>
                
                <div className="border-b dark:border-gray-700">
                    <nav className="flex">
                        <button onClick={() => setActiveTab('display')} className={`flex-1 p-3 text-sm font-medium transition-colors ${activeTab === 'display' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Megjelenés</button>
                        <button onClick={() => setActiveTab('toc')} className={`flex-1 p-3 text-sm font-medium transition-colors ${activeTab === 'toc' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Tartalomjegyzék</button>
                    </nav>
                </div>

                {activeTab === 'display' && (
                <div className="p-4 space-y-6 overflow-y-auto custom-scrollbar">
                    {/* Font Size */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Betűméret</label>
                        <div className="flex items-center space-x-4">
                            <span className="text-lg">A</span>
                            <input type="range" min="0.8" max="2.0" step="0.1" value={settings.fontSize} onChange={e => onSettingsChange({ fontSize: parseFloat(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/>
                             <span className="text-3xl">A</span>
                        </div>
                    </div>

                     {/* Font Family */}
                    <div>
                        <label htmlFor="font-family" className="block text-sm font-medium mb-2">Betűtípus</label>
                        <select id="font-family" value={settings.fontFamily} onChange={e => onSettingsChange({ fontFamily: e.target.value })} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                            {FONT_FAMILIES.map(font => <option key={font.name} value={font.value} style={{fontFamily: font.value}}>{font.name}</option>)}
                        </select>
                    </div>

                     {/* Text Align */}
                    <div>
                         <label className="block text-sm font-medium mb-2">Igazítás</label>
                         <div className="grid grid-cols-4 gap-2">
                             {(['text-left', 'text-center', 'text-right', 'text-justify'] as const).map(align => (
                                 <button key={align} onClick={() => onSettingsChange({ textAlign: align })} className={`p-2 rounded-md border ${settings.textAlign === align ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                     <Icon name={align.replace('text-','')} className="w-5 h-5 mx-auto"/>
                                 </button>
                             ))}
                         </div>
                    </div>
                    
                    {/* Color Palette */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Színséma</label>
                        <div className="grid grid-cols-4 gap-2">
                            {COLOR_PALETTES.map(palette => (
                                <button key={palette.name} onClick={() => onSettingsChange({ backgroundColor: palette.bg, textColor: palette.text })} className={`h-12 w-full rounded-md border-2 ${settings.backgroundColor === palette.bg ? 'border-indigo-500' : 'border-transparent'}`} style={{ backgroundColor: palette.bg }} title={palette.name}></button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Background Pattern */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Háttérminta</label>
                        <div className="grid grid-cols-4 gap-2">
                             {BACKGROUND_PATTERNS.map(pattern => (
                                <button key={pattern.name} onClick={() => onSettingsChange({ backgroundPattern: pattern.value })} className={`h-12 w-full rounded-md border-2 pattern-preview ${settings.backgroundPattern === pattern.value ? 'border-indigo-500' : 'border-gray-300 dark:border-gray-600'}`} style={{ backgroundColor: settings.backgroundColor, backgroundImage: pattern.value }} title={pattern.name}></button>
                            ))}
                        </div>
                    </div>

                    {/* View Mode */}
                     <div>
                        <label className="block text-sm font-medium mb-2">Nézet</label>
                         <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                            <button onClick={() => onSettingsChange({ viewMode: 'scroll'})} className={`flex-1 p-2 text-sm rounded-md transition-colors ${settings.viewMode === 'scroll' ? 'bg-white dark:bg-gray-900 shadow' : ''}`}>Görgetés</button>
                            <button onClick={() => onSettingsChange({ viewMode: 'paginated'})} className={`flex-1 p-2 text-sm rounded-md transition-colors ${settings.viewMode === 'paginated' ? 'bg-white dark:bg-gray-900 shadow' : ''}`}>Lapozás</button>
                         </div>
                         <p className="text-xs text-gray-500 mt-2">A nézet váltásához újra be kell tölteni a könyvet.</p>
                    </div>

                </div>
                )}
                {activeTab === 'toc' && (
                    <div className="flex-grow overflow-y-auto custom-scrollbar">
                        <ul className="divide-y dark:divide-gray-700">
                           {toc.map((item, index) => (
                               <li key={index}>
                                   <button onClick={() => handleTocClick(item.href)} className="w-full text-left p-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                       {item.label.trim()}
                                   </button>
                               </li>
                           ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};
