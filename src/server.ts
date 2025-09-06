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
    version: '0.1.2',
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
      name: 'decode_qrcode_data_url',
      description: 'Decode a QR code from a data URL (data:<mime>;base64,...)',
      inputSchema: {
        type: 'object',
        required: ['imageDataUrl'],
        properties: {
          imageDataUrl: {
            type: 'string',
            description: 'Image data URL (base64) of the QR image.',
          },
        },
        additionalProperties: false,
      },
    },
    {
      name: 'decode_qrcode_image_url',
      description: 'Decode a QR code from an HTTP(S) image URL',
      inputSchema: {
        type: 'object',
        required: ['imageUrl'],
        properties: {
          imageUrl: { type: 'string', description: 'HTTP(S) URL to the QR image.' },
        },
        additionalProperties: false,
      },
    },
  ];
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (req: CallToolRequest) => {
  const name = req.params.name;
  const args = (req.params.arguments ?? {}) as { imageDataUrl?: string; imageUrl?: string };

  if (name === 'decode_qrcode_data_url') {
    if (!args.imageDataUrl || typeof args.imageDataUrl !== 'string') {
      throw new Error('Missing required argument: imageDataUrl');
    }
    const result = await decodeQr({ imageDataUrl: args.imageDataUrl });
    return { content: [{ type: 'text', text: result.text }] };
  }

  if (name === 'decode_qrcode_image_url') {
    if (!args.imageUrl || typeof args.imageUrl !== 'string') {
      throw new Error('Missing required argument: imageUrl');
    }
    const result = await decodeQr({ imageUrl: args.imageUrl });
    return { content: [{ type: 'text', text: result.text }] };
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
