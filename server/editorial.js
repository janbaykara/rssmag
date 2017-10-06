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
		TAGFREQ_FLOOR_CATEGORY: 20,
	 	TAGLENGTH_MAX_CATEGORY: 2,
		//
		TAGFREQ_FLOOR_ARTICLE: 2,
	 	TAGLENGTH_MAX_ARTICLE: 2,
	}, options)

	console.log(`Bundling ${articles.length} articles`)

	/**
	 * ARTICLE TAGGING
	 * Generate structured thematic definition
	 * IOT group articles later
	*/
	var tagger = autoTagger
	.useStopWords('en')
	.useStopWords(['the','and'
		// Technical
		,'http','https','www','com','co','org','php','spip'
		// Services
		,'feedburner', 'rss',
		// Syntax
		,'–',':','/',',','.','','–','\'','"'
		// Datetime
		,'2017','2016','2015','2014',
		,'January','February','March','April','May','June','July','August','September','October','November','December'
		// Numbers
		,'0','1','2','3','4','5','6','7','8','9','10'
		// Things that should be auto-filtered
		,'internationalviewpoint'
	])

	// Catwide tag library
	let catTags = new Set()

	articles = articles.map(article => {
		// Text of article to search through
		let textBlob =
			article.title
			+(article.keywords ? ' '+article.keywords.join(' ') : '')
			// +(
			// 	article.content ? article.content.content :
			// 	article.summary ? article.summary.content : ''
			// )
		textBlob = textBlob.replace(new RegExp(article.origin.title,'i'), '')
		textBlob = htmlToText.fromString(textBlob);

		// Tag each article
		article.tagData = tagger
			.fromText(textBlob,
			opts.TAGFREQ_FLOOR_ARTICLE,
			opts.TAGLENGTH_MAX_ARTICLE)

		// Flatten the tags, removing the number frequency
		article.tags = article.tagData.map(tag => tag.word)
		article.tags.concat(article.keywords)

		// Add to the category-wide tag library
		article.tags.forEach(tag => catTags.add(tag))

		console.log(article.title, article.tagData)

		return article
	})

	console.log(catTags)

	/**
	 * BUNDLING
	 * 		TODO: Group tags by overlap
	 * 		TODO: Identify similar tags (thesaurus, different forms of same word)
	 * 		TODO: Focus on unusual words (e.g. by low->high corpus frequency)
	 * Possible tools
	 * 		leventshein
	 *				https://stackoverflow.com/a/42287748/1053937
	 * 		natural
	 * 				https://dzone.com/articles/using-natural-nlp-module
	 * 		naivebayesclassifier
	 * 		node-svm
	 * 				http://svmlight.joachims.org/
	*/

	let overlaps = {}

	// Tag statistics
	Array.from(catTags).forEach((t,i,arr) => {
		let CAT_TAG_PERCENT = 0.5
		if(i < arr.length*CAT_TAG_PERCENT) {
			overlaps[t] = {}
			articles.forEach(a => {
				if(a.tags.includes(t)) {
					// Document tag overlaps
					a.tags.forEach(aTag => {
						if(aTag === t) return;
						overlaps[t][aTag] = overlaps[t][aTag] === undefined ? 1 : overlaps[t][aTag]++
					})
				}
			})
		}
	})

	// each tag
		// each article
			// each tags
				// dict[tag][aTag]++

	console.log(overlaps)

	// Now order the tags by [1] global frequency, [2] overlaps
	// => b[tag].articles.push(article.title)

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

	// console.log(articles.map(a=>({title: a.title, bundle: a.bundle})))
	// console.log(b)
}
