import dotenv from 'dotenv'
import axios from 'axios'
import { setupCache } from 'axios-cache-adapter-node'
import nodeJsonDriver from './nodeJsonDriver'

dotenv.config()

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
	  maxAge: 1000 * 60 * 60 * 4, //ms
		debug: true,
    exclude: {
      query: false
    }
	}).adapter
})

function getStream(streamId, requiredArticleN) {
	return new Promise((resolve, reject) => {
		let articles = [];
		let continuation = '';

		(function fetch() {
			api
			.get(`streams/${encodeURIComponent(streamId)}/contents${continuation}`)
			.catch((e)=>reject(e))
			.then(res => {
				console.log(`🎃 API access number __${res.headers['x-ratelimit-count']}__ - ${res.request.fromCache ? 'CACHED' : 'new data'}`);
				// console.log("🤢 contents/?continuation="+continuation, res.data.items.length)
				articles = articles.concat(res.data.items);
				if(articles.length >= requiredArticleN || !res.data.continuation) {
					console.log("😈 ARTICLEDATA acquired, no. of articles: ",articles.length);
					return resolve(articles)
				} else if(res.data.continuation) {
					continuation = `?continuation=${res.data.continuation}`;
					// console.log("Next continuation stream: ",res.data.continuation)
					return fetch();
				}
			});
		})();
	});
}

export default { api, getStream }
