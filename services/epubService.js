
// ePub is loaded from CDN and available globally

export const extractMetadata = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    try {
      const book = ePub(fileBuffer);
      book.loaded.metadata.then(async (metadata) => {
        const title = metadata.title || 'Ismeretlen cím';
        const author = metadata.creator || 'Ismeretlen szerző';
        const description = metadata.description || null;
        let coverUrl = null;
        if (book.cover) {
          const coverBlob = await book.archive.getBlob(book.cover);
          if (coverBlob) {
            coverUrl = URL.createObjectURL(coverBlob);
          }
        }
        resolve({ title, author, description, coverUrl });
      }).catch(reject);
    } catch (error) {
      reject(error);
    }
  });
};
