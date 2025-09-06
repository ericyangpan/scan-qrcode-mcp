import Jimp from 'jimp';
import jsQR from 'jsqr';
import { parseBase64DataUrl } from '../utils/data-url.js';

export type DecodeInput =
  | { imageDataUrl: string; imageUrl?: undefined }
  | { imageUrl: string; imageDataUrl?: undefined };

export interface DecodeResult {
  text: string;
}

/**
 * Decode a QR code from a Buffer containing an image (PNG/JPEG/etc).
 */
export async function decodeQrFromBuffer(buffer: Buffer): Promise<DecodeResult> {
  const image = await Jimp.read(buffer);
  const { data, width, height } = image.bitmap;

  // Jimp gives a Node Buffer; jsQR expects a Uint8ClampedArray in RGBA order (same layout as Canvas ImageData).
  const clamped = new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength);
  const qr = (
    jsQR as unknown as (
      data: Uint8ClampedArray,
      width: number,
      height: number,
    ) => { data: string } | null
  )(clamped, width, height);
  if (!qr) {
    throw new Error('No QR code detected in image');
  }
  return { text: qr.data };
}

/**
 * Decode a QR code from a data URL string (data:<mime>;base64,<data>).
 */
export async function decodeQrFromDataUrl(dataUrl: string): Promise<DecodeResult> {
  const { buffer } = parseBase64DataUrl(dataUrl);
  return decodeQrFromBuffer(buffer);
}

/**
 * Fetch an image over HTTP(S) and decode its QR code.
 */
export async function decodeQrFromUrl(url: string): Promise<DecodeResult> {
  if (!/^https?:\/\//i.test(url)) {
    throw new Error('Only http(s) URLs are supported for imageUrl');
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return decodeQrFromBuffer(buffer);
}

/**
 * High-level dispatcher that accepts either a data URL or an image URL.
 */
export async function decodeQr(input: DecodeInput): Promise<DecodeResult> {
  if ('imageDataUrl' in input && input.imageDataUrl) {
    return decodeQrFromDataUrl(input.imageDataUrl);
  }
  if ('imageUrl' in input && input.imageUrl) {
    return decodeQrFromUrl(input.imageUrl);
  }
  throw new Error('Provide either imageDataUrl or imageUrl');
}
