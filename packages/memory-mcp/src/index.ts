import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { saveMemory, searchMemories } from './db.js';

const server = new Server(
  { name: '@skillspace/memory-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'save_memory',
        description: 'Save important facts or notes to long-term memory for later retrieval.',
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'The fact or note to remember.',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional tags to categorize this memory.',
            },
          },
          required: ['content'],
        },
      },
      {
        name: 'search_memory',
        description: 'Search long-term memory for past facts, notes, or tasks using keywords.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Keywords to search for in past memories.',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return (default 10).',
            },
          },
          required: ['query'],
        },
      },
    ],
  };
});

const saveSchema = z.object({
  content: z.string(),
  tags: z.array(z.string()).optional().default([]),
});

const searchSchema = z.object({
  query: z.string(),
  limit: z.number().optional().default(10),
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (request.params.name === 'save_memory') {
      const args = saveSchema.parse(request.params.arguments);
      const id = saveMemory(args.content, args.tags);
      return {
        content: [{ type: 'text', text: `Successfully saved memory with ID ${id}` }],
      };
    }
    
    if (request.params.name === 'search_memory') {
      const args = searchSchema.parse(request.params.arguments);
      const results = searchMemories(args.query, args.limit);
      
      if (results.length === 0) {
        return { content: [{ type: 'text', text: 'No matching memories found.' }] };
      }

      const formatted = results.map(r => 
        `[${r.timestamp}] (ID: ${r.id}) ${r.tags ? `[${r.tags}] ` : ''}${r.content}`
      ).join('\n');

      return {
        content: [{ type: 'text', text: `Found ${results.length} memories:\n\n${formatted}` }],
      };
    }

    throw new Error('Tool not found');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Validation Error: ${error.message}` }],
      };
    }
    return {
      isError: true,
      content: [{ type: 'text', text: `Internal Error: ${error instanceof Error ? error.message : String(error)}` }],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('@skillspace/memory-mcp running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
