
// Hypher and hypher_hu are loaded from CDN

const SOFT_HYPHEN = '\u00AD';

let hyphenator = null;

const initializeHyphenator = () => {
    if (typeof Hypher !== 'undefined' && typeof hypher_hu !== 'undefined') {
        hyphenator = new Hypher(hypher_hu);
    } else {
        console.warn("Hypher library not loaded. Hyphenation will be disabled.");
        hyphenator = {
            hyphenateText: (text) => text,
        };
    }
};

const walk = (node) => {
    if (node.nodeType === 3) { // Text node
        const text = node.nodeValue;
        if (text) {
            if (!hyphenator) {
                initializeHyphenator();
            }
            const hyphenatedText = hyphenator.hyphenateText(text);
            node.nodeValue = hyphenatedText.replace(/-/g, SOFT_HYPHEN);
        }
    } else {
        node.childNodes.forEach(walk);
    }
};

export const hyphenate = (element) => {
    if (!element) return;
    try {
        walk(element);
    } catch(e) {
        console.error("Hyphenation failed", e);
    }
};
