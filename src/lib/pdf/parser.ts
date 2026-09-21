// Polyfill DOMMatrix and canvas globals for Node.js / Server Actions
import 'pdf-parse/worker';

const pdfParse = require('pdf-parse');

export async function parsePdfBuffer(pdfBuffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(pdfBuffer);

    if (!data.text || data.text.trim().length === 0) {
      throw new Error(
        'PDF file appears to be empty or contains scanned images with no extractable text.'
      );
    }

    return data.text;
  } catch (error) {
    console.error('Error parsing PDF buffer:', error);
    throw new Error(
      `Failed to extract text from PDF: ${(error as Error).message}`
    );
  }
}
