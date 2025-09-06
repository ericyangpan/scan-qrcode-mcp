#!/usr/bin/env node
/**
 * MCP server exposing a tool to decode QR codes from either a data URL or an image URL.
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
  type ListToolsResult,
} from '@modelcontextprotocol/sdk/types.js';
import { decodeQr } from './services/qrcode-service.js';

const server = new Server(
  {
    name: 'scan-qrcode-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools: ListToolsResult['tools'] = [
    {
      name: 'decode_qrcode',
      description:
        'Decode a QR code from either a data URL (data:<mime>;base64,...) or an HTTP(S) image URL.',
      inputSchema: {
        type: 'object',
        properties: {
          imageDataUrl: { type: 'string', description: 'Image data URL (base64) of the QR image.' },
          imageUrl: { type: 'string', description: 'HTTP(S) URL to the QR image.' },
        },
        anyOf: [{ required: ['imageDataUrl'] }, { required: ['imageUrl'] }],
        additionalProperties: false,
      },
    },
  ];
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (req: CallToolRequest) => {
  if (req.params.name !== 'decode_qrcode') {
    throw new Error(`Unknown tool: ${req.params.name}`);
  }
  const args = (req.params.arguments ?? {}) as { imageDataUrl?: string; imageUrl?: string };
  if (!args.imageDataUrl && !args.imageUrl) {
    throw new Error('Provide either imageDataUrl or imageUrl');
  }
  if (args.imageDataUrl && args.imageUrl) {
    throw new Error('Provide only one of imageDataUrl or imageUrl');
  }
  const result = await decodeQr(
    args.imageDataUrl ? { imageDataUrl: args.imageDataUrl } : { imageUrl: args.imageUrl! },
  );

  return {
    content: [
      {
        type: 'text',
        text: result.text,
      },
    ],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
