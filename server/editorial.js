import htmlToText from 'html-to-text'
import autoTagger from 'auto-tagger'
import corpus from 'subtlex-word-frequencies'
import synonyms from 'synonyms'
import URLdiegoPerini from './URLregex'

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
	,'internationalviewpoint', 'cnn', 'bbc', 'order order'
])

/**
 * @param {Array} articles Feedly entries
 * @param {Object} options
 * @returns {Object} Entries grouped by topic
*/
export default function bundleArticles(articles, options = {}) {
	const opts = Object.assign({},{
		TAG_MIN_FREQUENCY_ARTICLE: 2,
		TAG_MAX_WORDS_ARTICLE: 2,
		//
		TAG_MIN_FREQUENCY_CATEGORY: 20,
	 	TAG_MAX_WORDS_CATEGORY: 2,
		//
		TAG_MIN_CHAR_LENGTH: 5,
		TAG_NOVELTY_PERCENT: 0.33,
		BUNDLE_SIZE_MIN: 2,
		BUNDLE_SIZE_MAX: 7,
		EXCLUSIVE_BUNDLES_BOOL: true,
		//
		SNIPPET_MIN_LENGTH: 100,
		SNIPPET_MAX_LENGTH: 350,
	}, options)

	console.log(`Bundling ${articles.length} articles`)

	/**
	 * ARTICLE TAGGING
	 * Generate structured thematic definition
	 * IOT group articles later
	*/

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

		// Remove source name
		textBlob = textBlob.replace(new RegExp(article.origin.title,'gi'), '')
		textBlob = textBlob.replace(new RegExp(article.author,'gi'), '')

		// Unformat
		textBlob = textBlob.toLowerCase()
		textBlob = htmlToText.fromString(textBlob);

		// Add to category corpus
		categoryBlob += textBlob

		// Get article corpus tags
		article.tagData = tagger
			.fromText(textBlob,
				opts.TAG_MIN_FREQUENCY_ARTICLE,
				opts.TAG_MAX_WORDS_ARTICLE)
		article.tagData = article.tagData.filter(t => t.word.length >= opts.TAG_MIN_CHAR_LENGTH)

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


	/**
	 * CATEGORY TAGGING
	 * Generate category-level tags
	 * Using categoryBlob corpus assembled above
	*/

	// Get category corpus tags
	let categoryTags = tagger
		.fromText(categoryBlob,
			opts.TAG_MIN_FREQUENCY_CATEGORY,
			opts.TAG_MAX_WORDS_CATEGORY)

	// Delete short strings
	categoryTags = categoryTags.filter(t => t.word.length >= opts.TAG_MIN_CHAR_LENGTH)

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


	/**
	 * BUNDLE ARTICLES
	 * Group articles around the category-level tags
	 * Recurse until bundle abides by config constraints,
	 * 	or this is no longer possible
	*/

	let collection = {bundles:{}, unbundled:[]};
	let retries = {};
	let tryN = 1;

	(function assignArticlesToBundles() {
		// console.log(`🐝 BUNDLING ATTEMPT ${tryN}`)

		categoryTags.forEach((tag,i,arr) => {
			if(i > (arr.length * opts.TAG_NOVELTY_PERCENT)) return false

			let tagArr = tagArray(tag)

			// console.log(i, arr.length, tag)

			collection.bundles[tag] = collection.bundles[tag] || []
			articles.forEach(article => {
				if(
					tagArr.some(t => article.tags.includes(t))
					&& (
						(opts.EXCLUSIVE_BUNDLES_BOOL && !article.assignedBundle)
						|| (!opts.EXCLUSIVE_BUNDLES_BOOL)
					)
				) {
					// if(tryN === 1) {
					// 	console.log(`📩 Bundling in ${tag}: ${article.title}`)
					// } else {
					// 	console.log(`✴️➡️ Moving to ${tag}: ${article.title}`)
					// }
					article.assignedBundle = tag
					collection.bundles[tag].push(article)
				} else if(article.assignedBundle) {
					// console.log(`✴️ Article is bundled in ${article.assignedBundle}: ${article.title}`)
					// console.log(`Article is bundled in ${article.assignedBundle}: ${article.title}`)
				} else {
					// console.log(`❌ No tags: ${article.title}`)
				}
			})
		});

		tryN++;

		// Remove single-article bundles and try again
		let deviantBundles = Object.keys(collection.bundles).filter(k => collection.bundles[k].length < opts.BUNDLE_SIZE_MIN || collection.bundles[k].length > opts.BUNDLE_SIZE_MAX);
		if(deviantBundles.length > 0) {
			console.log(`😡 Deviant bundles: ${deviantBundles.length}`)
			deviantBundles.forEach(k => {
				retries[k] = retries[k] ? retries[k] + 1 : 2;
				// console.log('⛔️ Deleting tag ',k, collection.bundles[k].length);
				collection.bundles[k].forEach(A => {
					// console.log("SHOULD have assignedBundle", articles.find(a=>a.title === A.title).assignedBundle)
					delete A.assignedBundle
					// console.log("Shouldn't have assignedBundle", articles.find(a=>a.title === A.title).assignedBundle)
				})
				delete collection.bundles[k];
				categoryTags.splice(categoryTags.indexOf(k),1);
			})

			// Don't keep going if the articles have no place else to go
			let sortedLonelies = Object.keys(retries).map(k => retries[k]).sort((a,b) => b - a);
			if(sortedLonelies[0] <= sortedLonelies[1] && categoryTags.length > 0) {
				assignArticlesToBundles()
			}
		}
	})();

	// And the rest
	collection.unbundled = articles.filter(a => !a.assignedBundle);

	console.log(`\n
		🍾🎉🤓 Bundling complete.
		\n${Object.keys(collection.bundles).length - 1} bundles containing ${articles.length-collection.unbundled.length}/${articles.length} articles.
		\n`);

	/**
	 * TRANSFORM ARTICLES
	 * Prepare data for UI
	*/

	Object.keys(collection.bundles).forEach(k => {
		// Order each bundle by article's engagementRate
		collection.bundles[k] = collection.bundles[k].sort((a,b)=>(b.engagementRate || 0) - (a.engagementRate || 0))

		// And trim the payload
		collection.bundles[k] = collection.bundles[k].map(article => ({
			title: article.title,
			published: article.published,
			source: article.origin ? article.origin.title : null,
			sourceURL: article.origin ? article.origin.htmlUrl : null,
			author: article.author,
			engagementRate: article.engagementRate,
			assignedBundle: article.assignedBundle,
			summary: article.summary ? formatSummary(article.summary.content) : article.content ? formatSummary(article.content.content) : null,
			visual: article.visual,
			url: article.alternate.href
		}))
	})

	collection.bundles = Object.keys(collection.bundles).map(k => ({ name: k, articles: collection.bundles[k] }))
	collection.bundles.forEach(b => {
		b.aggEngagementRate = b.articles.reduce(x=>x.engagementRate || 0)
		b.avgEngagementRate = b.aggEngagementRate / b.articles.length
	})

	// Order bundles by length +-, avgEngagement +-
	collection.bundles.sort((a,b) => {
		if(b.articles.length === a.articles.length) {
			return b.avgEngagementRate - a.avgEngagementRate
		}
		return b.articles.length - a.articles.length
	})

	collection.unbundled = collection.unbundled.map(articleFormatting)
	collection.unbundled.sort((a,b) => (b.engagementRate || 0) - (a.engagementRate || 0));

	// console.log(collection)

	return collection;




	/**
	 * UTILS
	*/
	function formatSummary(text, maxlength = opts.SNIPPET_MAX_LENGTH, minlength = opts.SNIPPET_MIN_LENGTH) {
		text = htmlToText.fromString(text)
		if(text.length < minlength) return null
		text = text.substring(0,maxlength)
		var urlTag = new RegExp('\\[?'+URLdiegoPerini+'\\]?','gi')
		text = text.replace(urlTag, '')
		return text
	}
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
