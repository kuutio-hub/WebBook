
// pdf.js is loaded from CDN and available as pdfjsLib

export const extractPdfMetadata = async (fileBuffer, fallbackTitle) => {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: fileBuffer });
    const pdf = await loadingTask.promise;
    const metadata = await pdf.getMetadata();
    
    const title = metadata.info.Title || fallbackTitle || 'Ismeretlen cím';
    const author = metadata.info.Author || 'Ismeretlen szerző';

    // Render first page to a canvas to get a cover image
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;

    const coverUrl = canvas.toDataURL();
    
    // Cleanup
    canvas.remove();

    return { title, author, description: metadata.info.Subject || null, coverUrl };

  } catch (error) {
    console.error('Error processing PDF metadata:', error);
    // Return fallback metadata on error
    return { title: fallbackTitle || 'Ismeretlen cím', author: 'Ismeretlen szerző', description: null, coverUrl: null };
  }
};
