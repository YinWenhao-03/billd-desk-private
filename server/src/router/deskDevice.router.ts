// @ts-nocheck
// Authenticated saved devices; credentials encrypted with AES-256-GCM.
const Router = require('koa-router');
const crypto = require('crypto');
const db = require('@/config/mysql').default;
const deskUser = require('@/service/deskUser.service').default;
const { DEVICE_ENCRYPTION_KEY } = require('@/secret/secret');

const router = new Router({ prefix: '/desk_user' });
const key = crypto.createHash('sha256').update(String(DEVICE_ENCRYPTION_KEY)).digest();
let tableReady;
function ensureTable() {
  return tableReady ||= db.query(`CREATE TABLE IF NOT EXISTS desk_saved_device (
  owner_uuid VARCHAR(64) NOT NULL,
  remote_uuid VARCHAR(64) NOT NULL,
  device_name VARCHAR(120) NOT NULL,
  credential TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (owner_uuid, remote_uuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
}

function seal(password) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const body = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64');
}

function unseal(value) {
  const buf = Buffer.from(value, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, buf.subarray(0, 12));
  decipher.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString('utf8');
}

async function owner(ctx) {
  const { uuid, password } = ctx.request.body || {};
  if (typeof uuid !== 'string' || typeof password !== 'string' ||
      !(await deskUser.login({ uuid, password }))) {
    ctx.status = 401;
    ctx.body = { code: 401, message: '设备身份验证失败' };
    return null;
  }
  await ensureTable();
  return uuid;
}

router.post('/sync_devices', async (ctx) => {
  const uuid = await owner(ctx);
  if (!uuid) return;
  const devices = ctx.request.body.devices;
  if (!Array.isArray(devices) || devices.length > 50) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '设备列表格式错误' };
    return;
  }
  let saved = 0;
  for (const item of devices) {
    if (typeof item?.uuid !== 'string' || !/^[a-zA-Z0-9-]{4,64}$/.test(item.uuid) ||
        typeof item?.password !== 'string' || item.password.length > 128 || !item.password ||
        typeof item?.name !== 'string' || !item.name.trim()) continue;
    if (!(await deskUser.login({ uuid: item.uuid, password: item.password }))) continue;
    await db.query(`INSERT INTO desk_saved_device
      (owner_uuid, remote_uuid, device_name, credential) VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE device_name=VALUES(device_name), credential=VALUES(credential)`,
      { replacements: [uuid, item.uuid, item.name.trim().slice(0, 120), seal(item.password)] });
    saved++;
  }
  ctx.body = { code: 200, data: { saved } };
});

router.post('/list_devices', async (ctx) => {
  const uuid = await owner(ctx);
  if (!uuid) return;
  const [rows] = await db.query(`SELECT remote_uuid, device_name, credential
    FROM desk_saved_device WHERE owner_uuid=? ORDER BY updated_at DESC LIMIT 50`,
    { replacements: [uuid] });
  ctx.body = { code: 200, data: rows.map((row) => ({
    uuid: row.remote_uuid,
    name: row.device_name,
    password: unseal(row.credential),
  })) };
});

router.post('/delete_device', async (ctx) => {
  const uuid = await owner(ctx);
  if (!uuid) return;
  const remoteUuid = ctx.request.body.remote_uuid;
  if (typeof remoteUuid !== 'string') {
    ctx.status = 400;
    ctx.body = { code: 400, message: '设备代码错误' };
    return;
  }
  await db.query('DELETE FROM desk_saved_device WHERE owner_uuid=? AND remote_uuid=?',
    { replacements: [uuid, remoteUuid] });
  ctx.body = { code: 200, data: null };
});

export default router;
