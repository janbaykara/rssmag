import Router from 'koa-router';
//
import bundleArticles from './editorial';
import Feedly from './feedly';

const router =  new Router();

// e.g. http://localhost:3001/api/feedly/categories
router.get('/api/feedly/:endpoint', async (ctx, next) => {
	await next()
	try {
		let res = await Feedly.api.get(ctx.params.endpoint)
		ctx.body = res.data
	} catch(e) {
		console.log(e)
	}
})

router.get('/api/bundle/:n/:mode/articles/:streamId', async (ctx, next) => {
	await next()
	try {
		let streamArticles;

		switch(ctx.params.mode) {
			case 'streamed':
				streamArticles = await Feedly.getArticles(`streams/${encodeURIComponent(ctx.params.streamId)}/contents`, {}, ctx.params.n)
				break;

			case 'mixed':
				streamArticles = await Feedly.getArticles(`mixes/contents`, {
					streamId: ctx.params.streamId,
					hours: 24,
					backfill: true,
					count: Math.min(20, ctx.params.n)
				}, ctx.params.n)
				break;
		}

		ctx.body = {
			id: `${ctx.params.method}/${ctx.params.streamId}`,
			articles: await bundleArticles(streamArticles)
		}

	} catch(e) {
		console.log(e)
	}
})

export default router
