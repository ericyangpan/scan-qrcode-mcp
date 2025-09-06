# Scan QRCode MCP Server

MCP server that decodes QR codes from either a data URL (base64) or an HTTP(S) image URL and returns the decoded text.

## Features

- Tool `decode_qrcode` accepts either `imageDataUrl` or `imageUrl`.
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

### Claude Desktop

- Follow the MCP install guide: https://modelcontextprotocol.io/quickstart/user
- Use one of the JSON configs above (name it `qrcode`).

### Claude Code

Add the server via CLI (choose one):

```bash
# Using npx (no global install required)
claude mcp add qrcode npx scan-qrcode-mcp@latest

# Or using the global binary
claude mcp add qrcode scan-qrcode-mcp
```

### VS Code (GitHub Copilot with MCP)

- Follow: https://code.visualstudio.com/docs/copilot/chat/mcp-servers#_add-an-mcp-server
- Or add via VS Code CLI (npx example):

```bash
code --add-mcp '{"name":"qrcode","command":"npx","args":["scan-qrcode-mcp@latest"]}'
```

### Codex CLI

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

### Cursor

- Settings -> MCP -> Add new MCP Server
- Name: `qrcode`
- Option A (recommended): `command` = `npx`, `args` = `["scan-qrcode-mcp@latest"]`
- Option B (global): `command` = `scan-qrcode-mcp`, `args` = `[]`

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
