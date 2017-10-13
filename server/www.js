import 'http';
import dotenv from 'dotenv';
import Koa from 'koa';
import json from 'koa-json';
import staticRoute from 'koa-static';
import Router from 'koa-router';
import cache from 'koa-rest-cache';
import socketIO from 'koa-socket';
//
import bundleArticles from './editorial';
import Feedly from './feedly';
import Progress from './progress';

dotenv.config();
const app = new Koa();
const router =  new Router();

app.use(cache({
  pattern: "/api/**/*",
  maxAge: 1000 * 60 * 60 * 1 // ms
}));
app.use(json());
app.use(router.routes());
app.use(router.allowedMethods());
app.use(staticRoute('./client/build'));

// new socket for each request?
// const chat = new IO( 'chat' )

// e.g. http://localhost:3001/api/feedly/categories
router.get('/api/feedly/:endpoint', async (ctx, next) => {
	await next();
	try {
		let res = await Feedly.api.get(ctx.params.endpoint);
		ctx.body = res.data;
	} catch(e) {
		console.log(e);
	}
})

const articlesIO = new socketIO('/api/bundle')
articlesIO.attach(app)

articlesIO.on('request', async (ctx, req) => {
	try {
		let streamArticles;
		const tracker = new Progress((progress) => {
			console.log(progress.loadingPercent)
			ctx.socket.emit(`progress#${req.fetchId}`, progress)
		});

		switch(req.mode) {
			case 'streamed':
				streamArticles = await Feedly.getArticles(`streams/${encodeURIComponent(req.streamId)}/contents`, {}, req.n, tracker.assign(0.5))
				break;

			case 'mixed':
				streamArticles = await Feedly.getArticles(`mixes/contents`, {
					streamId: req.streamId,
					hours: 24,
					backfill: true,
					count: Math.min(20, req.n)
				}, req.n, tracker.assign(0.5))
				break;
		}

		ctx.socket.emit(`response#${req.fetchId}`, {
			id: `${req.method}/${req.streamId}`,
			articles: await bundleArticles(streamArticles, {}, tracker.assign(0.5))
		})

	} catch(e) {
		console.log(e.message);
	}
})

// router.get('/api/bundle/:n/:mode/articles/:streamId', async (ctx, next) => {
// 	await next();
// 	try {
// 		let streamArticles;
//
// 		switch(ctx.params.mode) {
// 			case 'streamed':
// 				streamArticles = await Feedly.getArticles(`streams/${encodeURIComponent(ctx.params.streamId)}/contents`, {}, ctx.params.n)
// 				break;
//
// 			case 'mixed':
// 				streamArticles = await Feedly.getArticles(`mixes/contents`, {
// 					streamId: ctx.params.streamId,
// 					hours: 24,
// 					backfill: true,
// 					count: Math.min(20, ctx.params.n)
// 				}, ctx.params.n)
// 				break;
// 		}
//
// 		io.broadcast('loading', {percent: 0.5})
//
// 		ctx.body = {
// 			id: `${ctx.params.method}/${ctx.params.streamId}`,
// 			articles: await bundleArticles(streamArticles)
// 		}
//
// 	} catch(e) {
// 		console.log(e);
// 	}
// })

const port = 3001;

app.listen(port, () => {
	console.log(`Service started on port ${port}`)
});
