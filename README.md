# RSSMAG
A more natural, magazine-like reading experience for RSS.

Inspired by the history of print media, [Google News](news.google.com) and [Flipboard](flipboard.com).

Hopefully we can solve [this](https://news.ycombinator.com/item?id=12933006).

#### Broad goals
* [X] Integrates with [Feedly](feedly.com)
* [ ] Bundles multiple stories on specific issues
* [ ] Responsive magazine layout for stories
* [ ] Highlights notable stories (by reads, shares, etc.)

#### Notes
##### BUNDLING
* [ ] Identify specific topics / entities of articles
** [X] Focus on unusual words (e.g. by low->high corpus frequency)
** [ ] Identify similar tags (thesaurus, different forms of same word)
* [ ] Group tags by overlap, develop venn diagram of (near) exclusive article groups => bundle

###### Methods / tools
* [leventshein](https://stackoverflow.com/a/42287748/1053937)
* [natural (NLP)](https://dzone.com/articles/using-natural-nlp-module)
* [node-svm](http://svmlight.joachims.org/)
* naivebayesclassifier
