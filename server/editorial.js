import htmlToText from 'html-to-text'
import autoTagger from 'auto-tagger'
import corpus from 'subtlex-word-frequencies'
import synonyms from 'synonyms'
import URLdiegoPerini from './URLregex'

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
	console.log("Pre-gen bundle",articles.map(a=>a.generatedBundle))

	/**
	 * ARTICLE TAGGING
	 * Generate structured thematic definition
	 * IOT group articles later
	*/
	const tagger = autoTagger
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
	// TODO: Dedupe via synonyms

	let collection = {}
	categoryTags.forEach((tag,i,arr) => {
		if(i > (arr.length * opts.WORD_NOVELTY_PERCENT)) return false

		let tagArr = tagArray(tag)

		// console.log(i, arr.length, tag)

		collection[tag] = []
		articles.forEach(article => {
			if(
				tagArr.some(t => article.tags.includes(t))
				&& (
					(opts.EXCLUSIVE_BUNDLES_BOOL && !article.generatedBundle)
					|| (!opts.EXCLUSIVE_BUNDLES_BOOL)
				)
			) {
				console.log(`✅ Bundling in ${tag}: ${article.title}`)
				article.generatedBundle = tag
				collection[tag].push(article)
			} else if(article.generatedBundle) {
				// console.log(`✴️ Article is bundled in ${article.generatedBundle}: ${article.title}`)
				// console.log(`Article is bundled in ${article.generatedBundle}: ${article.title}`)
			} else {
				// console.log(`❌ No tags: ${article.title}`)
			}
		})
	})

	// And the rest
	collection['_unbundled'] = articles.filter(a => !a.generatedBundle)

	Object.keys(collection).forEach(k => {
		// Order each bundle by article's engagementRate
		collection[k] = collection[k].sort((a,b)=>(b.engagementRate || 0) - (a.engagementRate || 0))

		// And trim the payload
		collection[k] = collection[k].map(article => ({
			title: article.title,
			published: article.published,
			source: article.origin ? article.origin.title : null,
			sourceURL: article.origin ? article.origin.htmlUrl : null,
			author: article.author,
			engagementRate: article.engagementRate,
			generatedBundle: article.generatedBundle,
			summary: article.summary ? formatSummary(article.summary.content) : article.content ? formatSummary(article.content.content) : null,
			visual: article.visual,
			url: article.alternate.href
		}))
	})

	// console.log(collection)

	return collection;
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

function formatSummary(text, maxlength = 500) {
	text = htmlToText.fromString(text)
	text = text.substring(0,500)
	var urlTag = new RegExp('\\[?'+URLdiegoPerini+'\\]?','gi')
	text = text.replace(urlTag, '')
	return text
}
