
export interface BookRecord {
  id: number;
  title: string;
  author: string;
  coverUrl: string;
  file: ArrayBuffer;
}

export interface ReaderSettings {
  fontFamily: string;
  fontSize: number; // in rem
  lineHeight: number; // relative to font size
  letterSpacing: number; // in em
  textAlign: 'text-left' | 'text-center' | 'text-right' | 'text-justify';
  backgroundColor: string;
  textColor: string;
  backgroundPattern: string;
  viewMode: 'scroll' | 'paginated';
}
