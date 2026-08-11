// @vitest-environment node

import { describe, expect, test } from 'vitest'

import { POST } from '../../app/mcp/route'

type JsonRpcResponse = {
  jsonrpc: '2.0'
  id?: string | number | null
  result?: unknown
}

function getSseMessages(body: string): JsonRpcResponse[] {
  return body
    .split(/\r?\n\r?\n/)
    .flatMap((event) => {
      const data = event
        .split(/\r?\n/)
        .filter(line => line.startsWith('data:'))
        .map(line => line.slice('data:'.length).trim())
        .join('\n')

      return data ? [JSON.parse(data) as JsonRpcResponse] : []
    })
}

describe('MCP HTTP endpoint', () => {
  test('streams modern tool-discovery responses', async () => {
    const response = await POST(new Request('http://localhost:3030/mcp', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'mcp-method': 'tools/list',
        'mcp-protocol-version': '2026-07-28',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {
          _meta: {
            'io.modelcontextprotocol/clientCapabilities': {},
            'io.modelcontextprotocol/protocolVersion': '2026-07-28',
          },
        },
      }),
    }))

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/event-stream')
    expect(getSseMessages(await response.text())).toEqual(expect.arrayContaining([
      expect.objectContaining({
        jsonrpc: '2.0',
        id: 1,
        result: expect.objectContaining({
          tools: expect.arrayContaining([
            expect.objectContaining({ name: 'get_album_story' }),
            expect.objectContaining({ name: 'get_on_this_day_story' }),
            expect.objectContaining({ name: 'get_person_story' }),
          ]),
        }),
      }),
    ]))
  })

  test('serves the initialize exchange over a streaming HTTP response', async () => {
    const response = await POST(new Request('http://localhost:3030/mcp', {
      method: 'POST',
      headers: {
        accept: 'application/json, text/event-stream',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-11-05',
          capabilities: {},
          clientInfo: {
            name: 'vitest-mcp-http-client',
            version: '1.0.0',
          },
        },
      }),
    }))

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/event-stream')
    expect(getSseMessages(await response.text())).toEqual(expect.arrayContaining([
      expect.objectContaining({
        jsonrpc: '2.0',
        id: 1,
        result: expect.objectContaining({
          serverInfo: {
            name: 'history',
            version: '12.6.0',
          },
        }),
      }),
    ]))
  }, 20000)
})
