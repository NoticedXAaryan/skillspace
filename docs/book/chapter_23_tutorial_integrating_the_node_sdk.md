# Chapter 23: Step-by-Step Tutorial: Integrating the Node SDK

While the CLI is powerful for end-users, the true power of SkillSpace lies in embedding its deterministic runtime into existing applications using `@skillspace/sdk-ts`.

This chapter provides an exhaustive tutorial on integrating the SkillSpace engine into a Next.js App Router application. We will build a web endpoint that accepts a file upload, executes a published SkillSpace skill against that file, and returns structured JSON to the frontend.

---

## 1. Project Setup

Assume we have an existing Next.js application. We need to install the SDK.

```bash
npm install @skillspace/sdk-ts @skillspace/schema
```

> **Note:** The `@skillspace/sdk-ts` package automatically bundles `@skillspace/runtime`. It is designed to be fully compatible with Node.js environments. It currently relies on native Node APIs (`fs`, `child_process`), so it cannot run on Edge runtimes (like Vercel Edge Functions) without polyfills. Ensure your Next.js route is forced to the Node.js runtime.

---

## 2. Initializing the Client

Create a utility file `lib/skillspace.ts` to instantiate the SDK client. We only want to create this instance once and reuse it across requests to take advantage of connection pooling and adapter caching.

```typescript
import { SkillSpaceClient } from '@skillspace/sdk-ts';

// We initialize the client. It automatically reads ~/.skillspace/config.yaml
// for default models and API keys, but we can override them programmatically.
const client = new SkillSpaceClient({
  configOverride: {
    providers: {
      openai: {
        api_key: process.env.OPENAI_API_KEY // Pull from Vercel environment
      }
    }
  }
});

export default client;
```

---

## 3. Creating the Execution Endpoint

We will create a Next.js API route at `app/api/analyze/route.ts` that receives a text payload and runs a specific skill.

### 3.1 Resolving the Skill Programmatically

Before we execute, we need the skill. In a server environment, we don't use the CLI to `install` skills. Instead, the SDK provides methods to fetch and cache them dynamically.

```typescript
// app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import client from '@/lib/skillspace';
import { z } from 'zod';

// Define the expected input from the frontend
const RequestSchema = z.object({
  documentText: z.string().min(10),
  skillName: z.string()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { documentText, skillName } = RequestSchema.parse(body);

    // 1. Resolve the skill. 
    // The client will check the local cache (~/.skillspace). 
    // If not found, it can be configured to auto-download from the registry.
    const skill = await client.resolveSkill(skillName, { version: 'latest' });

    // 2. Prepare the execution options
    const result = await client.execute(skill, {
      input: documentText, // Inject the document text into {{input}}
      model: 'openai/gpt-4o', // Override default model
    });

    // 3. Return the result
    return NextResponse.json({
      success: true,
      output: result.output,
      usage: result.usage // Contains token counts for billing
    });

  } catch (error) {
    console.error('Execution failed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

---

## 4. Handling Structured Outputs (JSON)

One of the most powerful features of SkillSpace is forcing LLMs to return strict JSON matching a schema. If the `skill.yaml` specifies an `output_schema`, the SDK's `execute` method will automatically attempt to parse and validate the LLM's response.

Let's modify our route to handle strict JSON extraction.

```typescript
// app/api/analyze/route.ts

// ... [previous code]

    const result = await client.execute(skill, {
      input: documentText,
      model: 'openai/gpt-4o',
    });

    // If the skill defines output_format: 'json', result.output 
    // will be a stringified JSON object. We can parse it safely.
    let structuredData = null;
    if (skill.instructions.output_format === 'json') {
        try {
            structuredData = JSON.parse(result.output);
        } catch (e) {
            // The Executor attempts to parse and throw VALIDATION_FAILED internally,
            // but this is a secondary safety net.
            return NextResponse.json(
                { success: false, error: 'LLM returned malformed JSON' },
                { status: 502 }
            );
        }
    }

    return NextResponse.json({
      success: true,
      data: structuredData || result.output,
      tokensUsed: result.usage.totalTokens
    });
```

---

## 5. Streaming Responses to the Frontend

For long-running tasks, returning a standard JSON response takes too long. We should stream the LLM tokens directly to the user interface using the `runStream` equivalent in the SDK and the standard web `ReadableStream`.

```typescript
// app/api/stream/route.ts
import client from '@/lib/skillspace';

export async function POST(req: Request) {
  const body = await req.json();
  
  const skill = await client.resolveSkill(body.skillName);
  
  // Get the async generator from the SDK
  const stream = await client.executeStream(skill, {
    input: body.documentText,
  });

  // Convert the async generator into a web ReadableStream
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          // chunk.text contains the delta from the LLM
          controller.enqueue(new TextEncoder().encode(chunk.text));
        }
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    }
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

This streaming endpoint can be directly consumed by frontend libraries like Vercel's `ai` SDK (`useChat` or `useCompletion`), bridging the gap between the SkillSpace runtime and seamless UI experiences.

---

## 6. Advanced Integration: Intercepting Tool Calls

In a serverless environment, running local `stdio` MCP servers is impossible. The SDK allows you to intercept and override MCP tool execution logic.

If your skill requires an MCP tool (e.g., `get_database_record`), you can provide a custom `ToolHandler` to the client.

```typescript
const result = await client.execute(skill, {
  input: text,
  toolHandler: async (toolCall) => {
    if (toolCall.name === 'mcp_db_get_record') {
      const record = await myPrismaClient.records.findUnique({
          where: { id: toolCall.arguments.id }
      });
      return JSON.stringify(record);
    }
    throw new Error(`Unknown tool: ${toolCall.name}`);
  }
});
```
This entirely bypasses the internal `McpRegistry`, giving you absolute control over execution within your own backend architecture.
