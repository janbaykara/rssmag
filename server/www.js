import dotenv from 'dotenv'
import Koa from 'koa'
import koaStatic from 'koa-static'
import KoaRouter from 'koa-router'
import axios from 'axios'
import { setupCache } from 'axios-cache-adapter-node'
import nodeJsonDriver from './nodeJsonDriver'
import htmlToText from 'html-to-text'
import autoTagger from 'auto-tagger'

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
		store: new nodeJsonDriver({humanReadable: true}),
	  maxAge: 1000 * 60 * 60 * 24 * 7,
		debug: true
	}).adapter
})

// 2. Fetch Feedly data
// DOCS: https://developer.feedly.com/v3/sandbox/
feedlyAPI
.get('categories')
.then(res => {
	// console.log(`API access number __${res.headers['x-ratelimit-count']}__ - ${res.request.fromCache ? 'CACHED' : 'new data'}`)
	console.log(`No of Categories: ${res.data.length}`)

	// From above
	const streamId = 'user/3a94abfc-0869-47f0-9e7c-892608dd551c/category/Political Comment';

	feedlyAPI
	.get(`streams/${encodeURIComponent(streamId)}/contents`)
	.then(res => {
		// console.log(`API access number __${res.headers['x-ratelimit-count']}__ - ${res.request.fromCache ? 'CACHED' : 'new data'}`)
		console.log(`No of Entries: ${res.data.items.length}`)

		// Tag articles
		// Ultimately I want a venn diagram of most-exclusive tags
		var tags = autoTagger
			.useStopWords('en')
			.useStopWords(['http','https','www','com','co','org'])

		res.data.items.forEach(item => {
			let textBlob = item.title+/*item.keywords+*/(/*item.content ? item.content.content :*/ item.summary ? item.summary.content : '')
			textBlob = htmlToText.fromString(textBlob);
			console.log(tags.fromText(textBlob,3,3))
		})
	})
	.catch(console.log)

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
