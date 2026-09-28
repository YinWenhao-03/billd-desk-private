import Router from 'koa-router';
import crypto from 'crypto';
import deskUserService from '@/service/deskUser.service';
const router = new Router({ prefix: '/desk_user' });
router.post('/turn_credentials', async (ctx) => {
  const { uuid, password } = ctx.request.body || {};
  if (typeof uuid !== 'string' || typeof password !== 'string' || !await deskUserService.login({ uuid, password })) {
    ctx.status = 401; ctx.body = { code: 401, message: '设备身份验证失败' }; return;
  }
  const secret = process.env.TURN_SHARED_SECRET;
  const urls = process.env.TURN_URL;
  if (!secret || !urls) { ctx.status = 503; ctx.body = { code: 503, message: 'TURN 未配置' }; return; }
  const username = `${Math.floor(Date.now() / 1000) + 3600}:${uuid}`;
  const credential = crypto.createHmac('sha1', secret).update(username).digest('base64');
  ctx.body = { code: 200, data: { iceServers: [{ urls: urls.split(','), username, credential }] } };
});
export default router;
