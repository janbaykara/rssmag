import { URLSearchParams } from 'url';
import dotenv from 'dotenv';
import axios from 'axios';
import { setupCache } from 'axios-cache-adapter-node';
import nodeJsonDriver from './nodeJsonDriver';

dotenv.config();

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
});


//.get(`mixes/contents?hours=24&backfill=true&count=20&streamId=${encodeURIComponent(streamId)}/contents${continuation}`)
//.get(`streams/${encodeURIComponent(streamId)}/contents${continuation}`)
function getArticles(path, options, requiredArticleN) {
	let articles = [];

	return new Promise((resolve, reject) => {
		(function fetch() {
			let params = new URLSearchParams(options);
			let url = `${path}?${params.toString()}`;

			api
			.get(`${url}`)
			.catch((e)=>reject(e))
			.then(res => {
				console.log(`🎃 API access number __${res.headers['x-ratelimit-count']}__ - ${res.request.fromCache ? 'CACHED' : 'new data'}`);
				articles = articles.concat(res.data.items);
				if(articles.length < requiredArticleN && res.data.continuation) {
					options.continuation = res.data.continuation;
					return fetch();
				} else {
					console.log("😈 ARTICLEDATA acquired, no. of articles: ",articles.length);
					return resolve(articles)
				}
			});
		})();
	});
}

export default { api, getArticles }
