import htmlToText from 'html-to-text'
import autoTagger from 'auto-tagger'
import corpus from 'subtlex-word-frequencies'

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
		TAG_FREQUENCY_ARTICLE: 2,
		TAG_LENGTH_ARTICLE: 2,
		//
		TAG_FREQUENCY_CATEGORY: 10,
	 	TAG_LENGTH_CATEGORY: 2,
		//
		WORD_NOVELTY_PERCENT: 0.33,
		EXCLUSIVE_BUNDLES_BOOL: true,
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
		article.tagData = tagger.fromText(textBlob, opts.TAG_FREQUENCY_ARTICLE, opts.TAG_LENGTH_ARTICLE)
		article.tags = article.tagData.map(tag => tag.word)
		article.tags.concat(article.keywords)

		return article
	})

	let categoryTags = tagger.fromText(categoryBlob, opts.TAG_FREQUENCY_CATEGORY, opts.TAG_LENGTH_CATEGORY)

	let bundle = {}

	categoryTags = categoryTags.sort((a,b)=> {
		let aC = corpus.find(C => C.word == a.word)
		let bC = corpus.find(C => C.word == b.word)
		if(aC && bC)
			return aC.count - bC.count
		else
			return 0
	})
	categoryTags = categoryTags.map(t => t.word)

	// console.log(categoryTags)

	categoryTags.forEach((tag,i,arr) => {
		if(i > (arr.length * opts.WORD_NOVELTY_PERCENT)) return false
		console.log(i,arr.length)

		bundle[tag] = []
		articles.forEach(article => {
			if(article.tags.includes(tag) && (opts.EXCLUSIVE_BUNDLES_BOOL ? !article.bundle : true)) {
				article.bundle = tag
				bundle[tag].push(article.title)
			} else if(article.bundle) {
				// console.log(`Article is bundled in ${article.bundle}: ${article.title}`)
			}
		})
	})

	console.log(bundle)
}
