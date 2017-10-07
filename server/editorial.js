import htmlToText from 'html-to-text'
import autoTagger from 'auto-tagger'
import corpus from 'subtlex-word-frequencies'
import synonyms from 'synonyms'

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
		TAG_FREQUENCY_CATEGORY: 20,
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
	.useStopWords([
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
		,'internationalviewpoint', 'cnn', 'bbc'
	])

	let categoryBlob = ''

	articles.map(article => {
		// Ignore news source name
		// TODO: Ignore domain name (cnn in www.cnn.org)
		tagger.useStopWords([article.author])

		let textBlob =
			article.title
			+article.keywords
			+(
				// article.content ? article.content.content :
				article.summary ? article.summary.content : ''
			)

		// Remove article title
		textBlob = textBlob.replace(new RegExp(article.origin.title,'i'), '')

		// Unformat
		textBlob = textBlob.toLowerCase()
		textBlob = htmlToText.fromString(textBlob);

		// Add to category corpus
		categoryBlob += textBlob

		// Get article corpus tags
		article.tagData = tagger
			.fromText(textBlob,
				opts.TAG_FREQUENCY_ARTICLE,
				opts.TAG_LENGTH_ARTICLE)
		article.tagData = article.tagData.filter(t => t.word.length >= 4)

		// Simplify
		article.tags = article.tagData.map(tag => tag.word)
		article.tags.concat(article.keywords)

		let articleTags = []
		article.tags.forEach(t => {
			articleTags = articleTags.concat(tagArray(t,false))
		})
		article.tags = [...new Set(articleTags)]
		// console.log(article.title,'\n',article.tags)

		return article
	})

	// Get category corpus tags
	let categoryTags = tagger
		.fromText(categoryBlob,
			opts.TAG_FREQUENCY_CATEGORY,
			opts.TAG_LENGTH_CATEGORY)

	// Delete short strings
	categoryTags = categoryTags.filter(t => t.word.length >= 4)

	// Order from rarest to most common
	categoryTags = categoryTags.sort((a,b)=> {
		let aC = corpus.find(C => C.word == a.word)
		let bC = corpus.find(C => C.word == b.word)
		if(aC && bC)
			return aC.count - bC.count
		else
			return 0
	})

	// Simplify
	categoryTags = categoryTags.map(t => t.word)

	let bundle = {}
	categoryTags.forEach((tag,i,arr) => {
		if(i > (arr.length * opts.WORD_NOVELTY_PERCENT)) return false

		let tagArr = tagArray(tag)

		console.log(i, arr.length, tag, tagArr)

		bundle[tag] = []
		articles.forEach(article => {
			if(
				tagArr.some(t => article.tags.includes(t))
				&& (opts.EXCLUSIVE_BUNDLES_BOOL ? !article.bundle : true)
			) {
				article.bundle = tag
				bundle[tag].push(article.title)
			} else if(article.bundle) {
				// console.log(`Article is bundled in ${article.bundle}: ${article.title}`)
			}
		})
	})

	console.log(bundle)
}

function tagArray(tag, syns = true) {
	let tagArr = [tag]
	// Search snynoyms of this tag
	if(syns) {
		let synons = synonyms(tag,'n')
		if(synons) {
			tagArr = tagArr.concat(synons)
		}
	}
	// Search for this word without trailing s
	if(tag.charAt(tag.length-1) == 's') {
		tagArr.push(tag.slice(0,-1))
	}
	return tagArr
}
