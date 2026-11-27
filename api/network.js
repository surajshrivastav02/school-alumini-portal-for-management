import { createHandler } from '../server/handler.js';
import { redisStore } from '../server/store.js';

export default { fetch: createHandler(redisStore()) };
