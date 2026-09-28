import './init/alias';
import './init/initFile';
import { connectMysql } from '@/config/mysql';
import { connectRedis } from '@/config/redis';
import { createRedisPubSub } from '@/config/redis/pub';
import { setupKoa } from './setup';
async function main() {
  await connectMysql();
  await connectRedis();
  await createRedisPubSub();
  await setupKoa({ port: Number(process.env.NODE_APP_RELEASE_PROJECT_PORT || 4300) });
  console.log('BilldDesk private server ready. Thanks to Galaxy-s10 and contributors.');
}
main().catch(() => { console.error('Server initialization failed'); process.exit(1); });
