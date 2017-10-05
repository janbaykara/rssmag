import Koa from 'koa';
import koaStatic from 'koa-static';
import KoaRouter from 'koa-router';

const app = new Koa();
const router =  new KoaRouter();

// 1. User auth with Feedly
// 2. Fetch Feedly data
// 3. Categorise, bundle, format
// 4. Send to UI for rendering
router.get('/api/', async (ctx) => {
	ctx.body = {
		status: 'online',
		resources: {}
	}
});

app.use(router.routes());
// create-react-app in future
app.use(koaStatic('./build'));

const port = 3000;

app.listen(port, () => {
	console.log(`Service started on port ${port}`);
});
