# RSSMAG
A more natural, magazine-like reading experience for RSS.

Inspired by the history of print media, [Google News](news.google.com) and [Flipboard](flipboard.com).

Hopefully we can solve [this](https://news.ycombinator.com/item?id=12933006).

#### Todo
* [X] Integrates with [Feedly](feedly.com)
* [X] Highlights notable stories - uses Feedly 'engagementRate'
* [X] Bundles multiple stories on specific issues
** [X] Focus on unusual words (e.g. by low->high corpus frequency)
** [X] Identify similar tags (thesaurus, different forms of same word)
** [ ] Remove bundles with only 1 article
** [ ] Get reliable article URL from Feedly
** [X] Article snippets cut to 5 sentences
** [ ] Order bundles by size
** [ ] Display unbundled articles better
** [ ] Identify specific topics / entities of articles
** [ ] Group tags by overlap, develop venn diagram of (near) exclusive article groups => bundle
* [X] Responsive magazine layout for stories
** [ ] Category-wide visual hierarchy
** [ ] Guardian-style horizontal/vertical blocks

###### Methods / tools
* [leventshein](https://stackoverflow.com/a/42287748/1053937)
* [natural (NLP)](https://dzone.com/articles/using-natural-nlp-module)
* [node-svm](http://svmlight.joachims.org/)
* naivebayesclassifier
