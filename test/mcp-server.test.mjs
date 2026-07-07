import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { handleMcpMessage, listMcpTools } from '../lib/mcp-server.mjs';

test('mcp initialize handshake returns server info and tool capability', async () => {
  const response = await handleMcpMessage({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '0' } }
  });
  assert.equal(response.result.serverInfo.name, 'midas-framework');
  assert.ok(response.result.capabilities.tools);
});

test('mcp tools/list exposes the midas tool surface with schemas', async () => {
  const response = await handleMcpMessage({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
  const names = response.result.tools.map((tool) => tool.name);
  for (const expected of ['midas_next', 'midas_validate', 'midas_quick', 'midas_memory_add', 'midas_memory_search', 'midas_web_fetch']) {
    assert.ok(names.includes(expected), `missing tool ${expected}`);
  }
  for (const tool of response.result.tools) {
    assert.equal(tool.inputSchema.type, 'object');
    assert.ok(tool.description.length > 10);
  }
  assert.equal(response.result.tools.length, listMcpTools().length);
});

test('mcp tools/call runs memory add and search end to end', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'midas-mcp-'));
  const addResponse = await handleMcpMessage({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'midas_memory_add',
      arguments: { directory: temp, name: 'mcp-check', description: 'Entry created through MCP', body: 'roundtrip works' }
    }
  });
  assert.equal(addResponse.result.isError, false);
  const added = JSON.parse(addResponse.result.content[0].text);
  assert.equal(added.status, 'saved');

  const searchResponse = await handleMcpMessage({
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: { name: 'midas_memory_search', arguments: { directory: temp, query: 'roundtrip' } }
  });
  const found = JSON.parse(searchResponse.result.content[0].text);
  assert.equal(found.matchCount, 1);
  assert.equal(found.matches[0].name, 'mcp-check');
});

test('mcp unknown tool and unknown method are safe errors', async () => {
  const badTool = await handleMcpMessage({
    jsonrpc: '2.0',
    id: 5,
    method: 'tools/call',
    params: { name: 'midas_nonexistent', arguments: {} }
  });
  assert.equal(badTool.result.isError, true);

  const badMethod = await handleMcpMessage({ jsonrpc: '2.0', id: 6, method: 'resources/list' });
  assert.equal(badMethod.error.code, -32601);

  const notification = await handleMcpMessage({ jsonrpc: '2.0', method: 'notifications/initialized' });
  assert.equal(notification, null);
});

test('mcp handler never throws on malformed or hostile frames', async () => {
  const hostile = [
    null,
    42,
    'a string',
    [],
    { jsonrpc: '2.0', id: 7 },                                   // no method
    { jsonrpc: '2.0', id: 8, method: 'tools/call' },             // no params
    { jsonrpc: '2.0', id: 9, method: 'tools/call', params: { name: 'midas_next', arguments: null } },
    { jsonrpc: '2.0', id: 10, method: 'tools/call', params: { arguments: {} } }, // no tool name
    { jsonrpc: '2.0', id: 11, method: '../../etc/passwd' }
  ];
  for (const frame of hostile) {
    const response = await handleMcpMessage(frame);
    // Either a well-formed error or a tool-result error, never an exception.
    if (response !== null) {
      assert.equal(response.jsonrpc, '2.0');
      assert.ok('error' in response || 'result' in response);
    }
  }
});

test('mcp tool schemas are all valid JSON-schema objects with required arrays', () => {
  for (const tool of listMcpTools()) {
    assert.equal(typeof tool.name, 'string');
    assert.equal(tool.inputSchema.type, 'object');
    assert.equal(typeof tool.inputSchema.properties, 'object');
    assert.ok(Array.isArray(tool.inputSchema.required));
  }
});
