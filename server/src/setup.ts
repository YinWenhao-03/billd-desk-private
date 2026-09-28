import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { connectWebSocket } from '@/config/websocket';
import deskUserRouter from '@/router/deskUser.router';
import deskVersionRouter from '@/router/deskVersion.router';
import deskDeviceRouter from '@/router/deskDevice.router';
import deskTurnRouter from '@/router/deskTurn.router';

export async function setupKoa({ port }) {
  const app = new Koa();
  app.use(async (ctx, next) => {
    try { await next(); } catch (error: any) {
      ctx.status = error.httpStatusCode || error.status || 500;
      ctx.body = { code: ctx.status, message: ctx.status >= 500 ? '服务器内部错误' : error.message };
      console.error('HTTP request failed', ctx.status); // Never print request credentials.
    }
  });
  app.use(bodyParser({ jsonLimit: '128kb' }));
  const allowed = (process.env.CORS_ORIGINS || '').split(',').filter(Boolean);
  app.use(async (ctx, next) => {
    const origin = ctx.get('Origin');
    if (origin && (allowed.includes(origin) || origin === 'null')) {
      ctx.set('Access-Control-Allow-Origin', origin);
      ctx.set('Vary', 'Origin');
      ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    }
    if (ctx.method === 'OPTIONS') { ctx.status = 204; return; }
    await next();
  });
  const health = new Router();
  health.get('/health', (ctx) => { ctx.body = { code: 200, data: { ready: true } }; });
  for (const router of [health, deskUserRouter, deskVersionRouter, deskDeviceRouter, deskTurnRouter]) {
    app.use(router.routes()).use(router.allowedMethods());
  }
  const httpServer = app.listen(port);
  connectWebSocket(httpServer);
}
