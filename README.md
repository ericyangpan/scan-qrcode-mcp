# Scan QRCode MCP Server

MCP server that decodes QR codes from either a data URL (base64) or an HTTP(S) image URL and returns the decoded text.

## Features

- Two precise tools for decoding:
  - `decode_qrcode_data_url` — accepts `imageDataUrl`
  - `decode_qrcode_image_url` — accepts `imageUrl`
- Decodes common image formats (PNG, JPEG, etc.).
- Deterministic behavior with clear errors for invalid inputs.

## Getting Started

Configure this MCP server in your client using either `npx` (recommended) or the global binary.

Standard config (recommended, uses `npx`):

```json
{
  "mcpServers": {
    "qrcode": {
      "command": "npx",
      "args": [
        "scan-qrcode-mcp@latest"
      ]
    }
  }
}
```

Alternative using the global binary (after `npm i -g scan-qrcode-mcp`):

```json
{
  "mcpServers": {
    "qrcode": {
      "command": "scan-qrcode-mcp",
      "args": []
    }
  }
}
```

<details>
<summary>Claude Desktop</summary>

Follow the MCP install guide: https://modelcontextprotocol.io/quickstart/user
Use the Standard config JSON above (name it `qrcode`).

</details>

<details>
<summary>Claude Code</summary>

Use the Claude Code CLI to add the QR MCP server:

```bash
claude mcp add qrcode npx scan-qrcode-mcp@latest
```

</details>

<details>
<summary>VS Code (GitHub Copilot with MCP)</summary>

Follow: https://code.visualstudio.com/docs/copilot/chat/mcp-servers#_add-an-mcp-server
Or install via VS Code CLI (npx example):

```bash
code --add-mcp '{"name":"qrcode","command":"npx","args":["scan-qrcode-mcp@latest"]}'
```

</details>

<details>
<summary>Codex CLI</summary>

Edit `~/.codex/config.toml` and add one of the following:

```toml
[mcp_servers.qrcode]
command = "npx"
args = ["scan-qrcode-mcp@latest"]
```

or, if you installed globally:

```toml
[mcp_servers.qrcode]
command = "scan-qrcode-mcp"
```

</details>

<details>
<summary>Cursor</summary>

Settings -> MCP -> Add new MCP Server.
Name: `qrcode`. Either use `npx scan-qrcode-mcp@latest` or the global binary.

</details>

Notes:
- Requires Node.js 18.17+.
- If using the global binary but `scan-qrcode-mcp` is not found, ensure your global npm bin is on PATH and restart the client.

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

The server uses stdio transport and exposes two tools:

- `decode_qrcode_data_url`
  - Input: `{ imageDataUrl: string }` — `data:<mime>;base64,<data>` URL for the QR image
- `decode_qrcode_image_url`
  - Input: `{ imageUrl: string }` — `http(s)` URL to the QR image

Examples (pseudo-JSON-RPC over MCP):

Decode from data URL
```
{
  "method": "tools/call",
  "params": {
    "name": "decode_qrcode_data_url",
    "arguments": { "imageDataUrl": "data:image/png;base64,..." }
  }
}
```

Decode from image URL
```
{
  "method": "tools/call",
  "params": {
    "name": "decode_qrcode_image_url",
    "arguments": { "imageUrl": "https://example.com/qr.png" }
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
