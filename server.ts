import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';

/**
 * Stateless Pass-Through Real-Time Relay Server (Port 3000)
 * - TIDAK menyimpan data warga, riwayat chat, atau database ke disk/DB.
 * - Server hanya meneruskan paket antar perangkat yang sedang online di channel yang sama.
 */

interface RelayEnvelope {
  type:
    | 'relay:join'
    | 'relay:publish'
    | 'relay:ping'
    | 'relay:pong'
    | 'relay:joined'
    | 'relay:event';
  eventId?: string;
  channel?: string;
  channels?: string[];
  eventName?: string;
  payload?: unknown;
  senderDeviceHash?: string;
  sentAt?: string;
}

interface ConnectedClient {
  ws: WebSocket;
  channels: Set<string>;
  clientId: string;
}

const PORT = Number(process.env.PORT || 3000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '256kb' }));

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws-relay' });

  // Volatile RAM routing tables ONLY (no persistent database / zero citizen storage)
  const clients = new Set<ConnectedClient>();
  const channelSubscribers = new Map<string, Set<ConnectedClient>>();
  let volatileMonetizeRules: unknown = null;
  const volatileFrozenDeviceMasks = new Set<string>();

  function subscribeClient(client: ConnectedClient, channel: string) {
    const clean = channel.trim();
    if (!clean) return;
    client.channels.add(clean);
    let set = channelSubscribers.get(clean);
    if (!set) {
      set = new Set<ConnectedClient>();
      channelSubscribers.set(clean, set);
    }
    set.add(client);
  }

  function removeClientFromAll(client: ConnectedClient) {
    for (const ch of client.channels) {
      const set = channelSubscribers.get(ch);
      if (set) {
        set.delete(client);
        if (set.size === 0) {
          channelSubscribers.delete(ch);
        }
      }
    }
    client.channels.clear();
    clients.delete(client);
  }

  function broadcastToChannel(channel: string, data: string, excludeClient?: ConnectedClient) {
    const set = channelSubscribers.get(channel);
    if (!set) return;
    for (const sub of set) {
      if (sub === excludeClient) continue;
      if (sub.ws.readyState === WebSocket.OPEN) {
        sub.ws.send(data);
      }
    }
  }

  wss.on('connection', (ws) => {
    const client: ConnectedClient = {
      ws,
      channels: new Set<string>(),
      clientId: `cli-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    };
    clients.add(client);
    subscribeClient(client, 'admin:policy');

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString()) as RelayEnvelope;

        if (msg.type === 'relay:ping') {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'relay:pong', sentAt: new Date().toISOString() }));
          }
          return;
        }

        if (msg.type === 'relay:join' && Array.isArray(msg.channels)) {
          for (const ch of msg.channels) {
            if (typeof ch === 'string') {
              subscribeClient(client, ch);
            }
          }
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                type: 'relay:joined',
                channels: Array.from(client.channels),
                sentAt: new Date().toISOString(),
              })
            );
            // Send lightweight volatile admin policy / frozen-device blocklist on join
            if (volatileMonetizeRules) {
              ws.send(
                JSON.stringify({
                  type: 'relay:event',
                  eventId: `policy-init-${Date.now()}`,
                  channel: 'admin:policy',
                  eventName: 'admin:monetize_rules',
                  payload: volatileMonetizeRules,
                  sentAt: new Date().toISOString(),
                })
              );
            }
            if (volatileFrozenDeviceMasks.size > 0) {
              ws.send(
                JSON.stringify({
                  type: 'relay:event',
                  eventId: `zt-init-${Date.now()}`,
                  channel: 'admin:policy',
                  eventName: 'zt:frozen_list',
                  payload: Array.from(volatileFrozenDeviceMasks),
                  sentAt: new Date().toISOString(),
                })
              );
            }
          }
          return;
        }

        if (msg.type === 'relay:publish' && msg.channel && msg.eventName) {
          // Keep ONLY ephemeral admin rules / device freeze list in RAM; citizen payloads are never stored
          if (msg.eventName === 'admin:monetize_rules' && msg.payload) {
            volatileMonetizeRules = msg.payload;
          } else if (
            msg.eventName === 'zt:device_freeze' &&
            msg.payload &&
            typeof msg.payload === 'object'
          ) {
            const p = msg.payload as { deviceId?: string; status?: string };
            if (p.deviceId && p.status === 'frozen_lost') {
              volatileFrozenDeviceMasks.add(p.deviceId);
            } else if (p.deviceId && p.status === 'trusted') {
              volatileFrozenDeviceMasks.delete(p.deviceId);
            }
          }

          const outbound = JSON.stringify({
            type: 'relay:event',
            eventId:
              msg.eventId ||
              `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            channel: msg.channel,
            eventName: msg.eventName,
            payload: msg.payload,
            senderDeviceHash: msg.senderDeviceHash,
            sentAt: msg.sentAt || new Date().toISOString(),
          });

          broadcastToChannel(msg.channel, outbound, client);
        }
      } catch {
        // Ignore malformed frames
      }
    });

    ws.on('close', () => {
      removeClientFromAll(client);
    });

    ws.on('error', () => {
      removeClientFromAll(client);
    });
  });

  // Lightweight health endpoint (zero citizen PII)
  app.get('/api/relay-health', (_req, res) => {
    res.json({
      status: 'ok',
      mode: 'stateless-pass-through',
      citizenDatabaseStorage: 'none',
      connectedClients: clients.size,
      activeChannels: channelSubscribers.size,
    });
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[WargaQu Relay] Running stateless HTTP+WS server on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[WargaQu Relay] Failed to start server:', err);
  process.exit(1);
});
