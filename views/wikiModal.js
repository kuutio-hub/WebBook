
import { ICONS } from './icons.js';
import { APP_NAME, APP_VERSION } from '../constants.js';

export function renderWikiModal() {
  const modalWrapper = document.createElement('div');
  modalWrapper.className = "fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4";
  
  modalWrapper.innerHTML = `
    <div class="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <header class="p-4 border-b dark:border-gray-700 flex items-center justify-between flex-shrink-0">
            <h2 class="text-2xl font-bold font-serif">Súgó & Információ</h2>
            <button data-action="close" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                ${ICONS.close}
            </button>
        </header>
        <div class="p-6 overflow-y-auto custom-scrollbar prose prose-sm dark:prose-invert max-w-none">
            <h3>Üdvözlünk a ${APP_NAME} (v${APP_VERSION}) alkalmazásban!</h3>
            <p>Ez egy böngésző alapú e-könyv olvasó, amelynek célja, hogy egyszerű és személyre szabható olvasási élményt nyújtson. Minden adatot – a könyveidet és a beállításaidat – helyben, a te böngésződ tárol, így teljes kontrollal rendelkezel felettük.</p>
            
            <h4>Fő Funkciók</h4>
            <ul>
                <li><strong>Könyv Feltöltése:</strong> Kattints a "Feltöltés" gombra, és válaszd ki a számítógépedről a beolvasni kívánt könyvet.</li>
                <li><strong>Támogatott Formátum:</strong> Az alkalmazás jelenleg a <strong>.EPUB</strong> formátumot támogatja, ami a legelterjedtebb e-könyv szabvány.</li>
                <li><strong>Könyvtár:</strong> A feltöltött könyveid borítói megjelennek a főoldalon. Egy borítóra kattintva megtekintheted a könyv adatait, vagy elindíthatod az olvasást.</li>
                <li><strong>Adatvédelem:</strong> A könyveid sosem hagyják el a gépedet. Az alkalmazás az IndexedDB nevű böngészőtechnológiát használja a biztonságos, helyi tároláshoz.</li>
            </ul>

            <h4>Olvasó Nézet</h4>
            <p>Az olvasó felületet úgy terveztük, hogy a lehető legkényelmesebb legyen.</p>
            <ul>
                <li><strong>Automatikus Mentés:</strong> Az olvasási pozíciód automatikusan mentésre kerül, így bármikor ott folytathatod, ahol abbahagytad.</li>
                <li><strong>Kétpaneles "Könyv" Nézet:</strong> Nagyobb képernyőkön (pl. monitoron vagy fektetett tableten) az olvasó automatikusan kétoldalas nézetre vált, imitálva egy valódi könyvet. Ebben a módban az oldalak szélére kattintva lapozhatsz.</li>
                <li><strong>Egypaneles Nézet:</strong> Kisebb képernyőkön (pl. telefonon) az olvasó egyetlen, görgethető vagy lapozható oszlopban jelenik meg.</li>
            </ul>

            <h4>Személyre Szabás</h4>
            <p>Az olvasó nézetben a fogaskerék ikonra kattintva rengeteg beállítási lehetőséget találsz:</p>
            <ul>
                <li><strong>Betűméret és -típus:</strong> Állítsd be a neked kényelmes méretet és válassz a beépített, olvasáshoz optimalizált betűtípusok közül.</li>
                <li><strong>Színsémák és Háttérminták:</strong> Válassz előre definiált színpaletták (pl. Solarized, Nord, papír) és finom háttérminták közül.</li>
                <li><strong>Margók:</strong> Állítsd be a függőleges és vízszintes margókat, hogy a szöveg ne lógjon be a képernyő szélein lévő kameraszigetek (notch) vagy más elemek alá.</li>
                <li><strong>Nézet Mód:</strong> Válassz a folyamatos <strong>görgetés</strong> és a klasszikus <strong>lapozás</strong> között (kisebb képernyőkön).</li>
                <li><strong>Téma (Sötét/Világos):</strong> A főoldalon lévő ikonokkal válthatsz világos, sötét és rendszer-alapú (automatikus) téma között.</li>
            </ul>
        </div>
         <footer class="p-4 border-t dark:border-gray-700 text-right flex-shrink-0">
            <button data-action="close" class="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Bezárás</button>
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
