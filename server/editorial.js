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
	,'internationalviewpoint', 'cnn', 'bbc', 'order order', 'theguardian', 'times'
])

/**
 * @param {Array} articles Feedly entries
 * @param {Object} options
 * @returns {Object} Entries grouped by topic
*/
export default function bundleArticles(articles, options = {}, addProgress) {
	return new Promise((resolve) => {
		const opts = Object.assign({},{
			TAG_MIN_FREQUENCY_ARTICLE: 2,
			TAG_MAX_WORDS_ARTICLE: 2,
			//
			TAG_MIN_FREQUENCY_CATEGORY: 20,
		 	TAG_MAX_WORDS_CATEGORY: 2,
			//
			TAG_MIN_CHAR_LENGTH: 5,
			TAG_NOVELTY_PERCENT: 0.05,
			BUNDLE_SIZE_MIN: 2,
			BUNDLE_SIZE_MAX: 7,
			//
			EXCLUSIVE_BUNDLES_BOOL: true,
			CATEGORY_CORPUS: false,
			//
			SNIPPET_MIN_LENGTH: 100,
			SNIPPET_MAX_LENGTH: 350,
		}, options);

		/**
		 * ARTICLE TAGGING
		 * Generate structured thematic definition
		 * IOT group articles later
		*/

		addProgress(0, `⚽️ Extracting article tags from ${articles.length} articles`);

		if(opts.CATEGORY_CORPUS) var categoryBlob = ''
		articles.map((article,i) => {
			if(i%20 === 0) addProgress(0.3*(i/articles.length), `Tagged ${article.title}`);

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
			if(opts.CATEGORY_CORPUS) categoryBlob += textBlob

			// Get article corpus tags
			article.tagData = tagger
				.fromText(textBlob,
					opts.TAG_MIN_FREQUENCY_ARTICLE,
					opts.TAG_MAX_WORDS_ARTICLE)

			// Remove short words
			article.tagData = article.tagData.filter(t => t.word.length >= opts.TAG_MIN_CHAR_LENGTH)

			// Flatten to word array
			article.tags = article.tagData.map(tag => tag.word)

			// Include keywords
			article.tags = article.tags.concat(article.keywords)

			// Entities

			// Remove empty elements
			article.tags = article.tags.filter(String)
			article.tags = article.tags.filter(Boolean)

			// Delete short strings
			article.tags = article.tags.filter(t => t.length >= opts.TAG_MIN_CHAR_LENGTH)

			// Dedupe tags
			article.tags = [...new Set(article.tags)]

			return article
		})


		/**
		 * CATEGORY TAGGING
		 * Generate category-level tags
		 * Using categoryBlob corpus assembled above
		*/
		addProgress(0, "⚽️ Extracting category-wide tags");

		let categoryTags

		if(opts.CATEGORY_CORPUS) {
			// Either create new, high-level tags
			// 	from a category corpus tags
			categoryTags = tagger
				.fromText(categoryBlob,
					opts.TAG_MIN_FREQUENCY_CATEGORY,
					opts.TAG_MAX_WORDS_CATEGORY)

			// Simplify
			categoryTags = categoryTags.map(t => t.word)
		} else {
			// Or aggregate article-level tags
			categoryTags = []

				categoryTags = categoryTags.concat(a.tags)
			articles.forEach((a,i) => {
				if(i%20 === 0) addProgress(0.3*(i/articles.length), `Extracted from ${a.title}`);
			})

			categoryTags = [...new Set(categoryTags)]
		}

		// Order least common
		categoryTags = categoryTags.sort((a,b)=> {
			let aC = corpus.find(C => C.word == a)
			let aCCount = aC ? aC.count : 0
			let bC = corpus.find(C => C.word == b)
			let bCCount = bC ? bC.count : 0
			return aC - bC
		})

		/**
		 * BUNDLE ARTICLES
		 * Group articles around the category-level tags
		 * Recurse until bundle abides by config constraints,
		 * 	or this is no longer possible
		*/

		addProgress(0, `⚽️ Bundling articles into ${categoryTags.length} tags`);

		let stream = {bundles:{}, unbundled:[]};
		let retries = {};
		let tryN = 1;

		(function assignArticlesToBundles() {
			// addProgress(0.6, `🐝 BUNDLING ATTEMPT ${tryN}`)

			categoryTags.forEach((tag,i,arr) => {
				if(i > (arr.length * opts.TAG_NOVELTY_PERCENT)) return false

				let tagArr = tagArray(tag, true)

				// console.log(`${i} / ${arr.length} - ${tag} (${tagArr.length})`)

				stream.bundles[tag] = stream.bundles[tag] || []
				articles.forEach(article => {
					if(
						tagArr.some(t => article.tags.includes(t))
						&& (
							(opts.EXCLUSIVE_BUNDLES_BOOL && !article.assignedBundle)
							|| (!opts.EXCLUSIVE_BUNDLES_BOOL)
						)
					) {
						// if(tryN === 1) {
						// 	addProgress(0.6, `📩 Bundling in ${tag}: ${article.title}`)
						// } else {
						// 	addProgress(0.6, `✴️➡️ Moving to ${tag}: ${article.title}`)
						// }
						article.assignedBundle = tag
						stream.bundles[tag].push(article)
					} else if(article.assignedBundle) {
						// addProgress(0.6, `✴️ Article is bundled in ${article.assignedBundle}: ${article.title}`)
						// addProgress(0.6, `Article is bundled in ${article.assignedBundle}: ${article.title}`)
					} else {
						// addProgress(0.6, `❌ No tags: ${article.title}`)
					}
				})
			});

			tryN++;

			// Remove single-article bundles and try again
			let deviantBundles = Object.keys(stream.bundles).filter(k => stream.bundles[k].length < opts.BUNDLE_SIZE_MIN || stream.bundles[k].length > opts.BUNDLE_SIZE_MAX);
			if(deviantBundles.length > 0) {
				// addProgress(0.3*(i/categoryTags.length), `Bundling attempt ${tryN} - 😡 Deviant bundles: ${deviantBundles.length}`)
				deviantBundles.forEach(k => {
					retries[k] = retries[k] ? retries[k] + 1 : 2;
					// addProgress(0.6, '⛔️ Deleting tag ',k, stream.bundles[k].length);
					stream.bundles[k].forEach(A => {
						delete A.assignedBundle
						// addProgress(0.6, "SHOULD have assignedBundle", articles.find(a=>a.title === A.title).assignedBundle)
						// addProgress(0.6, "Shouldn't have assignedBundle", articles.find(a=>a.title === A.title).assignedBundle)
					})
					delete stream.bundles[k];
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
		stream.unbundled = articles.filter(a => !a.assignedBundle);

		addProgress(0, `\n
			🍾🎉🤓 Bundling complete.\n
			${Object.keys(stream.bundles).length} bundles containing ${articles.length-stream.unbundled.length}/${articles.length} articles.
			\n
			\n⚽️ Ordering and formatting`);

		/**
		 * TRANSFORM ARTICLES
		 * Prepare data for UI
		*/

		Object.keys(stream.bundles).forEach(k => {
			// Order each bundle by article's engagementRate
			stream.bundles[k] = stream.bundles[k].sort((a,b)=>(b.engagementRate || 0) - (a.engagementRate || 0))
			// And trim the payload
			stream.bundles[k] = stream.bundles[k].map(articleFormatting)
		})

		// Order bundles by length +-, avgEngagement +-
		stream.bundles = Object.keys(stream.bundles).map(k => ({ name: k, articles: stream.bundles[k] }))
		stream.bundles.forEach(b => {
			b.aggEngagementRate = b.articles.reduce((sum,x)=>sum + (x.engagementRate ? parseFloat(x.engagementRate) : 0), 0)
			b.avgEngagementRate = b.aggEngagementRate / b.articles.length
		})
		stream.bundles.sort((a,b) => {
			if(b.articles.length === a.articles.length) {
				return b.avgEngagementRate - a.avgEngagementRate
			}
			return b.articles.length - a.articles.length
		})

		stream.unbundled = stream.unbundled.map(articleFormatting)
		stream.unbundled.sort((a,b) => (b.engagementRate || 0) - (a.engagementRate || 0));

		addProgress(1, '⚽️ Done!');

		return resolve(stream);

		/**
		 * UTILS
		*/

		function articleFormatting(article) {
			return {
				id: article.id,
				title: article.title,
				published: article.published,
				source: article.origin ? article.origin.title : null,
				sourceURL: article.origin ? article.origin.htmlUrl : null,
				author: article.author,
				engagementRate: Number(article.engagementRate || 0),
				assignedBundle: article.assignedBundle,
				summary: article.summary ? formatSummary(article.summary.content) : article.content ? formatSummary(article.content.content) : null,
				imageURL: article.visual ? article.visual.url : null,
				url: article.alternate[0].href
			}
		}

		function formatSummary(text, maxlength = opts.SNIPPET_MAX_LENGTH, minlength = opts.SNIPPET_MIN_LENGTH) {
			text = htmlToText.fromString(text)
			if(text.length < minlength) return null
			text = text.substring(0,maxlength)
			var urlTag = new RegExp('\\[?'+URLdiegoPerini+'\\]?','gi')
			text = text.replace(urlTag, '')
			return text
		}
	})
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
