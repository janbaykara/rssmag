import dotenv from 'dotenv'
import Koa from 'koa'
import koaStatic from 'koa-static'
import KoaRouter from 'koa-router'
import bundleArticles from './editorial'
import Feedly from './feedly'

dotenv.config()

const app = new Koa()
const router =  new KoaRouter()

// 2. Fetch Feedly data
// DOCS: https://developer.feedly.com/v3/sandbox/
Feedly.api
.get('categories')
.catch(console.log)
.then(res => {
	console.log(`🎃 API access number __${res.headers['x-ratelimit-count']}__ - ${res.request.fromCache ? 'CACHED' : 'new data'}`)
	console.log(`No of Categories: ${res.data.length}`)

	// From above
	const streamId = 'user/3a94abfc-0869-47f0-9e7c-892608dd551c/category/Political Comment'; // Political Comment
	// const streamId = 'user/3a94abfc-0869-47f0-9e7c-892608dd551c/category/World News' // World News

	Feedly.getEntries(streamId, 100)
	.then((articleData) => {
		bundleArticles(articleData)
	})
	.catch(console.log)
})

// 3. Categorise, bundle, format
// 4. Send to UI for rendering
router.get('/api/', async (ctx) => {
	ctx.body = {
		status: 'online',
		resources: {}
	}
})

app.use(router.routes())
// create-react-app in future
app.use(koaStatic('./build'))

const port = 3000

app.listen(port, () => {
	console.log(`Service started on port ${port}`)
})
