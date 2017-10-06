import dotenv from 'dotenv'
import Koa from 'koa'
import koaStatic from 'koa-static'
import KoaRouter from 'koa-router'
import axios from 'axios'
import { setupCache } from 'axios-cache-adapter-node'
import nodeJsonDriver from './nodeJsonDriver'
import htmlToText from 'html-to-text'
import autoTagger from 'auto-tagger'
import levenshtein from 'fast-levenshtein'

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
		let articles = res.data.items

		// console.log(`API access number __${res.headers['x-ratelimit-count']}__ - ${res.request.fromCache ? 'CACHED' : 'new data'}`)
		console.log(`No of Entries: ${articles.length}`)

		// Tag articles
		// Ultimately I want a venn diagram of most-exclusive tags
		var tagger = autoTagger
			.useStopWords('en')
			.useStopWords(['the','and'
				// Technical
				,'http','https','www','com','co','org','php','spip'
				// Services
				,'feedburner', 'rss',
				// Syntax
				,'–',':','/',',','.','','–'
				// Datetime
				,'2017','2016','2015','2014',
				,'January','February','March','April','May','June','July','August','September','October','November','December'
				// Things that should be auto-filtered
				,'internationalviewpoint'
			])

		let categoryBlob = ''

		articles.map(article => {
			let textBlob =
				article.title
				+article.keywords
				+(
					// article.content ? article.content.content :
					article.summary ? article.summary.content : ''
				)
			textBlob = textBlob.replace(new RegExp(article.origin.title,'i'), '')

			textBlob = htmlToText.fromString(textBlob);
			categoryBlob += textBlob
			article.tagData = tagger.fromText(textBlob,3,3)
			article.tags = article.tagData.map(tag => tag.word)
			article.tags.concat(article.keywords)

			return article
		})

		let categoryTags = tagger.fromText(categoryBlob,7,3)
		// Focus on unusual words (e.g. by low->high corpus frequency)
		// Group tags by overlap

		let bundle = {}

		categoryTags.map(t=>t.word).forEach(tag => {
			bundle[tag] = []
			articles.forEach(article => {
				if(article.tags.includes(tag) && !article.bundle) {
					article.bundle = tag
					bundle[tag].push(article.title)
				} else if(article.bundle) {
					// console.log(`Article is bundled in ${article.bundle}: ${article.title}`)
				}
			})
		})

		console.log(bundle)

		// leventshein
		//		https://stackoverflow.com/a/42287748/1053937
		// natural
		// 		https://dzone.com/articles/using-natural-nlp-module
		// naivebayesclassifier
		// node-svm
		// 		http://svmlight.joachims.org/

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
