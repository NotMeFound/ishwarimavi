import QRCode from 'qrcode';

/**
 * Generates a clean data URL QR code string for any public link or notice URL.
 */
export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 140,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    return '';
  }
}
