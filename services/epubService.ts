
declare const ePub: any; // ePub is loaded from CDN

interface BookMetadata {
  title: string;
  author: string;
  coverUrl: string | null;
}

export const extractMetadata = async (fileBuffer: ArrayBuffer): Promise<BookMetadata> => {
  return new Promise((resolve, reject) => {
    try {
      const book = ePub(fileBuffer);
      book.loaded.metadata.then(async (metadata: any) => {
        const title = metadata.title || 'Ismeretlen cím';
        const author = metadata.creator || 'Ismeretlen szerző';
        let coverUrl: string | null = null;
        if (book.cover) {
          const coverBlob = await book.archive.getBlob(book.cover);
          if (coverBlob) {
            coverUrl = URL.createObjectURL(coverBlob);
          }
        }
        resolve({ title, author, coverUrl });
      }).catch(reject);
    } catch (error) {
      reject(error);
    }
  });
};
