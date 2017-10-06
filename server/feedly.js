import axios from 'axios'
import { setupCache } from 'axios-cache-adapter-node'
import nodeJsonDriver from './nodeJsonDriver'

// 1. Feedly OAuth2
// - Using dev token for now
// consider https://github.com/hildjj/node-feedly ?

const api = axios.create({
	baseURL: 'http://cloud.feedly.com/v3/',
  headers: {
		'Authorization': `OAuth ${process.env.feedlyAccessToken}`
	},
	adapter: setupCache({
		store: new nodeJsonDriver({humanReadable: false}),
	  maxAge: 1000 * 60 * 60 * 24 * 7,
		debug: true,
    exclude: {
      query: false
    }
	}).adapter
})

function getEntries(streamId, requiredArticleN) {
	return new Promise((resolve, reject) => {
		let articleData = []
		let continuation = null

		fetch()

		function fetch() {
			return api
			.get(`streams/${encodeURIComponent(streamId)}/contents?continuation=${continuation}`)
			.catch((e)=>reject(e))
			.then(res => {
				console.log(`🎃 API access number __${res.headers['x-ratelimit-count']}__ - ${res.request.fromCache ? 'CACHED' : 'new data'}`)
				console.log("🤢 contents/?continuation="+res.data.continuation, res.data.items.length)
				articleData = articleData.concat(res.data.items)
				if(articleData.length >= requiredArticleN) {
					console.log("😈 ARTICLEDATA acquired, no. of articles: ",articleData.length)
					return resolve(articleData)
				} else {
					continuation = res.data.continuation
					return fetch()
				}
			})
		}
	})
}

export default { api, getEntries }
