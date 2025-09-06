/**
 * Utilities for parsing and handling data URLs.
 * All comments and docs must be in English as required.
 */

export function parseBase64DataUrl(dataUrl: string): { mime: string; buffer: Buffer } {
  const match = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl);
  if (!match) {
    throw new Error('Invalid data URL. Expected format: data:<mime>;base64,<data>');
  }
  const [, mime, data] = match;
  const buffer = Buffer.from(data, 'base64');
  return { mime, buffer };
}
