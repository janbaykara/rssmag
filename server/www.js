import dotenv from 'dotenv'
import Koa from 'koa'
import koaStatic from 'koa-static'
import KoaRouter from 'koa-router'
import bundleArticles from './editorial'
import Feedly from './feedly'

dotenv.config()

const app = new Koa()
const router =  new KoaRouter()

// e.g. http://localhost:3000/api/bundle/user%2F3a94abfc-0869-47f0-9e7c-892608dd551c%2Fcategory%2FPolitical%20Comment/100
router.get('/api/bundle/:streamId/:n', async (ctx, next) => {
	try {
		let articleData = await Feedly.getEntries(ctx.params.streamId, ctx.params.n)
		ctx.body = bundleArticles(articleData)
	} catch(e) {
		console.log(e)
	}
})

app.use(router.routes())
// create-react-app in future
app.use(koaStatic('./build'))

const port = 3000

app.listen(port, () => {
	console.log(`Service started on port ${port}`)
})
