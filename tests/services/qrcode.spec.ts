import { describe, it, expect } from 'vitest';
import {
  decodeQrFromDataUrl,
  decodeQrFromBuffer,
  decodeQrFromUrl,
  decodeQr,
} from '../../src/services/qrcode-service.js';
import QRCode from 'qrcode';
import Jimp from 'jimp';

describe('qrcode-service', () => {
  it('decodes a QR code from a data URL', async () => {
    const text = 'hello world';
    const dataUrl = await QRCode.toDataURL(text, { errorCorrectionLevel: 'M', width: 256 });
    const result = await decodeQrFromDataUrl(dataUrl);
    expect(result.text).toBe(text);
  });

  it('throws for invalid data URL', async () => {
    await expect(decodeQrFromDataUrl('not-a-data-url')).rejects.toThrow(/Invalid data URL/i);
  });

  it('decodes from a Buffer and errors when no QR is present', async () => {
    // Create a blank image to trigger "No QR code detected" error.
    const blank = await Jimp.create(64, 64, 0xffffffff);
    const blankBuf = await blank.getBufferAsync('image/png');
    await expect(decodeQrFromBuffer(blankBuf)).rejects.toThrow(/No QR code detected/i);

    // Now create a real QR code and decode from buffer.
    const message = 'buffer-path';
    const dataUrl = await QRCode.toDataURL(message, { errorCorrectionLevel: 'M', width: 128 });
    const base64 = dataUrl.split(',')[1]!;
    const buf = Buffer.from(base64, 'base64');
    const ok = await decodeQrFromBuffer(buf);
    expect(ok.text).toBe(message);
  });

  it('decodes from URL via dispatcher using mocked fetch', async () => {
    const message = 'url-dispatch';
    const dataUrl = await QRCode.toDataURL(message, { errorCorrectionLevel: 'M', width: 128 });
    const base64 = dataUrl.split(',')[1]!;
    const buf = Buffer.from(base64, 'base64');

    const originalFetch = globalThis.fetch;
    try {
      // Mock fetch to return our QR image buffer using Response
      const mockResponse = new Response(buf, { status: 200, statusText: 'OK' });
      const mockFetch: typeof fetch = async () => mockResponse as Response;
      globalThis.fetch = mockFetch;

      const viaUrl = await decodeQrFromUrl('https://example.com/qr.png');
      expect(viaUrl.text).toBe(message);

      const viaDispatch = await decodeQr({ imageUrl: 'https://example.com/qr.png' });
      expect(viaDispatch.text).toBe(message);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('rejects non-http(s) URL inputs', async () => {
    await expect(decodeQrFromUrl('ftp://example.com/qr.png')).rejects.toThrow(/Only http\(s\)/i);
  });
});
