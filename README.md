# Scan QRCode MCP Server

MCP server that decodes QR codes from either a data URL (base64) or an HTTP(S) image URL and returns the decoded text.

## Features

- Tool `decode_qrcode` accepts either `imageDataUrl` or `imageUrl`.
- Decodes common image formats (PNG, JPEG, etc.).
- Deterministic behavior with clear errors for invalid inputs.

## Project Structure

```
src/
  server.ts
  services/
    qrcode-service.ts
  utils/
    data-url.ts
tests/
  services/
    qrcode.spec.ts
```

## Scripts

- `npm i`: Install dependencies.
- `npm run dev`: Start MCP server in watch mode (stdio transport).
- `npm run build`: Compile TypeScript to `dist/`.
- `npm start`: Run compiled server from `dist/`.
- `npm test`: Run unit tests with coverage (Vitest).
- `npm run lint` / `npm run format`: Lint and format.

## Usage

The server uses stdio transport and exposes a single tool:

- Name: `decode_qrcode`
- Input schema:
  - Provide exactly one of:
    - `imageDataUrl`: string — a `data:<mime>;base64,<data>` URL for the QR image
    - `imageUrl`: string — an `http(s)` URL to the QR image

Example (pseudo-JSON-RPC over MCP):

```
{
  "method": "tools/call",
  "params": {
    "name": "decode_qrcode",
    "arguments": { "imageDataUrl": "data:image/png;base64,..." }
  }
}
```

Response text content contains the decoded string.

## Configuration

- Requires Node.js 18.17+ for built-in `fetch`.
- No environment variables are required.

## Security Notes

- Only `http(s)` is allowed for `imageUrl`. Data URLs must be base64-encoded.
- Do not pass untrusted remote URLs without appropriate allowlisting in your environment.

## License

MIT
