export async function parsePdfBuffer(pdfBuffer: Buffer): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfModule = require('pdf-parse');

    // Convert Node Buffer to standard Uint8Array
    const uint8Data = new Uint8Array(
      pdfBuffer.buffer,
      pdfBuffer.byteOffset,
      pdfBuffer.byteLength
    );

    let text = '';

    if (typeof pdfModule.PDFParse === 'function') {
      const instance = new pdfModule.PDFParse(uint8Data);

      if (typeof instance.getText === 'function') {
        const res = await instance.getText();
        text = typeof res === 'string' ? res : res?.text || '';
      } else if (typeof instance.parse === 'function') {
        const res = await instance.parse();
        text = typeof res === 'string' ? res : res?.text || '';
      } else {
        text = instance.text || instance.data?.text || '';
      }
    } else if (typeof pdfModule === 'function') {
      const data = await pdfModule(uint8Data);
      text = typeof data === 'string' ? data : data?.text || '';
    } else {
      throw new Error('Unable to resolve a valid PDF parsing entry point.');
    }

    if (!text || text.trim().length === 0) {
      throw new Error(
        'PDF file appears to be empty or contains scanned images with no extractable text.'
      );
    }

    return text;
  } catch (error) {
    console.error('Error parsing PDF buffer:', error);
    throw new Error(
      `Failed to extract text from PDF: ${(error as Error).message}`
    );
  }
}
