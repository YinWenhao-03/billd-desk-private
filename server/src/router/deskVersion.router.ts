import Router from 'koa-router';
const router = new Router({ prefix: '/desk_version' });
const version = { version: '0.1.1', show_version: '0.1.1', download: {}, checkUpdate: 2, isUpdate: 2, forceUpdate: 2, disableList: [] };
router.get('/latest', (ctx) => { ctx.body = { code: 200, data: version }; });
router.get('/check', (ctx) => { ctx.body = { code: 200, data: version }; });
router.get('/find_by_version', (ctx) => { ctx.body = { code: 200, data: version }; });
export default router;
