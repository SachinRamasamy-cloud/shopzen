import 'dotenv/config';
import { getRedis } from './src/config/redis.js';

(async () => {
  try {
    const r = getRedis();
    const pong = await r.ping();
    console.log('[test] ping:', pong);
    const ok = await r.set('__upstash_test__', 'ok', { ex: 10 });
    console.log('[test] set:', ok);
    const val = await r.get('__upstash_test__');
    console.log('[test] get:', val);
    await r.del('__upstash_test__');
    process.exit(0);
  } catch (err) {
     console.error('[test] error:', err);
    process.exit(1);
  }
})();
