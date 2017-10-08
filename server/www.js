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

// e.g. http://localhost:3000/api/bundle/user%2F3a94abfc-0869-47f0-9e7c-892608dd551c%2Fcategory%2FPolitical%20Comment/100
router.get('/api/bundle/:streamId/:n', async (ctx, next) => {
	await next()
	try {
		let articleData = await Feedly.getEntries(ctx.params.streamId, ctx.params.n)
		ctx.body = bundleArticles(articleData)
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
