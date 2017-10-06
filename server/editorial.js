import htmlToText from 'html-to-text'
import autoTagger from 'auto-tagger'

/**
 * @param {Array} articles Feedly entries
 * @param {Object} options
 * @param {Number} options.TAGFREQ_FLOOR_ARTICLE
 * @param {Number} options.TAGFREQ_FLOOR_CATEGORY
 * @param {Number} options.TAGLENGTH_MAX_ARTICLE
 * @param {Number} options.TAGLENGTH_MAX_CATEGORY
 * @returns {Object} Entries grouped by topic
*/

export default function bundleArticles(articles, options = {}) {
	const opts = Object.assign({},{
		TAGFREQ_FLOOR_CATEGORY: articles.length / 2.5,
		TAGFREQ_FLOOR_ARTICLE: 5,
	 	TAGLENGTH_MAX_ARTICLE: 2,
	 	TAGLENGTH_MAX_CATEGORY: 2,
	}, options)

	// console.log(`API access number __${res.headers['x-ratelimit-count']}__ - ${res.request.fromCache ? 'CACHED' : 'new data'}`)
	// console.log("Bundling",articles)
	console.log(`No of Entries: ${articles.length}`)
	// Dedupe
	articles = articles.filter((thing, index, self) => self.findIndex(t => t.title === thing.title) === index)
	// console.log("Bundling",articles)
	console.log(`Deduped Entries: ${articles.length}`)

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
			// Numbers
			,'0','1','2','3','4','5','6','7','8','9','10'
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
		article.tagData = tagger.fromText(textBlob, opts.TAGFREQ_FLOOR_ARTICLE, opts.TAGLENGTH_MAX_ARTICLE)
		article.tags = article.tagData.map(tag => tag.word)
		article.tags.concat(article.keywords)

		return article
	})

	let categoryTags = tagger.fromText(categoryBlob, opts.TAGFREQ_FLOOR_CATEGORY, opts.TAGLENGTH_MAX_CATEGORY)
	// Focus on unusual words (e.g. by low->high corpus frequency)
	// Group tags by overlap

	let bundle = {}

	categoryTags.map(t=>t.word).forEach(tag => {
		bundle[tag] = { combos: {}, articles: []}

		// Tag statistics
		articles.forEach(article => {
			if(article.tags.includes(tag)) {
				// Identify overlapping tags
				article.tags.forEach(articleTag => {
					if(articleTag === tag) return;
					bundle[tag].combos[articleTag] = bundle[tag].combos[articleTag] === undefined ? 0 : bundle[tag].combos[articleTag]++
				})
				article.bundle = article.bundle == undefined ? [tag] : [...article.bundle, tag]
			}
		})
	})

	// Now order the tags by [1] global frequency, [2] overlaps
	// => bundle[tag].articles.push(article.title)

	/*
		[a,b,c]
		[b,c]
		[a,b]
	*/

	// articles.map(a=>a.bundle).forEach(articleTagBundle => {
	// 	articleTagBundle.forEach(tag => {
	// 		tags[tag].push()
	// 	})
	// })

	// console.log(bundle)

	// leventshein
	//		https://stackoverflow.com/a/42287748/1053937
	// natural
	// 		https://dzone.com/articles/using-natural-nlp-module
	// naivebayesclassifier
	// node-svm
	// 		http://svmlight.joachims.org/
}
