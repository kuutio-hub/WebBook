
// Hypher and hypher_hu are loaded from CDN

const SOFT_HYPHEN = '\u00AD';
let hyphenator = null;

const initializeHyphenator = () => {
    if (hyphenator) return; // Already initialized

    if (typeof Hypher !== 'undefined' && typeof hypher_hu !== 'undefined') {
        hyphenator = new Hypher(hypher_hu);
    } else {
        // This case should be rare now with lazy initialization
        console.warn("Hypher library not ready. Hyphenation will be disabled.");
        hyphenator = { hyphenateText: (text) => text }; // Dummy object
    }
};

const walk = (node) => {
    if (node.nodeType === 3) { // Text node
        const text = node.nodeValue;
        if (text && text.trim().length > 0) {
            const hyphenatedText = hyphenator.hyphenateText(text);
            node.nodeValue = hyphenatedText.replace(/-/g, SOFT_HYPHEN);
        }
    } else {
        node.childNodes.forEach(walk);
    }
};

export const hyphenate = (element) => {
    if (!element) return;
    
    // Lazy initialization
    if (!hyphenator) {
        initializeHyphenator();
    }
    
    try {
        walk(element);
    } catch(e) {
        console.error("Hyphenation failed", e);
    }
};
