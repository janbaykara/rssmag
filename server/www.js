import dotenv from 'dotenv';
import Koa from 'koa';
import json from 'koa-json';
import staticRoute from 'koa-static';
import cache from 'koa-rest-cache';
//
//
import router from './routes';

dotenv.config();
const app = new Koa();

app.use(json());
app.use(cache({
  pattern: "/api/**/*",
  maxAge: 1000 * 60 * 60 * 1 // ms
}));
app.use(router.routes());
app.use(router.allowedMethods());
app.use(staticRoute('./client/build'));

const port = 3001;

app.listen(port, () => {
	console.log(`Service started on port ${port}`)
});
