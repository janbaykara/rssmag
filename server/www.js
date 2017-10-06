import dotenv from 'dotenv'
import Koa from 'koa'
import koaStatic from 'koa-static'
import KoaRouter from 'koa-router'
import axios from 'axios'
import { setupCache } from 'axios-cache-adapter-node'
import nodeJsonDriver from './nodeJsonDriver'

dotenv.config()

const app = new Koa()
const router =  new KoaRouter()

// 1. Feedly OAuth2
// - Using dev token for now
// consider https://github.com/hildjj/node-feedly ?
const feedlyAPI = axios.create({
	baseURL: 'http://cloud.feedly.com/v3/',
  headers: {
		'Authorization': `OAuth ${process.env.feedlyAccessToken}`
	},
	adapter: setupCache({
		store: new nodeJsonDriver(),
	  maxAge: 1000 * 60 * 60 * 24 * 7,
		debug: true
	}).adapter
})

// 2. Fetch Feedly data
// DOCS: https://developer.feedly.com/v3/sandbox/
feedlyAPI
	.get('categories')
	.then(response => {
		console.log(`API access number __${response.headers['x-ratelimit-count']}__ - ${response.request.fromCache ? 'CACHED' : 'new data'}`)
	})
	.catch(console.log)

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
