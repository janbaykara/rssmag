import dotenv from 'dotenv'
import Koa from 'koa'
import json from 'koa-json'
import staticRoute from 'koa-static'
import Router from 'koa-router'
import cache from 'koa-rest-cache'
//
import bundleArticles from './editorial'
import Feedly from './feedly'

dotenv.config()
const app = new Koa()
const router =  new Router()

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

app.use(cache({
  pattern: "/api/**/*",
  maxAge: 1000 * 60 * 60 * 1 // ms
}))
app.use(json())
app.use(router.routes())
app.use(router.allowedMethods())
app.use(staticRoute('./client/build'))

const port = 3001

app.listen(port, () => {
	console.log(`Service started on port ${port}`)
})
