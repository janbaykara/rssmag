import dotenv from 'dotenv'
import Koa from 'koa'
import koaStatic from 'koa-static'
import KoaRouter from 'koa-router'
import axios from 'axios'
import cachios from 'cachios'

dotenv.config()

const app = new Koa()
const router =  new KoaRouter()

// 1. Feedly OAuth2
//- Using dev token for now
// consider https://github.com/hildjj/node-feedly ?
let feedlyAPI = cachios.create(axios.create({
	baseURL: 'http://cloud.feedly.com/v3',
  headers: {
		'Authorization': `OAuth ${process.env.feedlyAccessToken}`
	}
}), { // Infinite cache
  stdTTL: 0,
  checkperiod: 0 // ms cron for cache deletion
})

// 2. Fetch Feedly data
// DOCS: https://developer.feedly.com/v3/sandbox/
feedlyAPI.get('/categories').then((x) => {
	console.log(`API calls today: ${x.headers['x-ratelimit-count']}`)
	console.log(x.data)
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
