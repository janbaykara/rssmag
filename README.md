# RSSMAG
A natural, magazine-like reading experience for Feedly, in the spirit of print/digital media's bold history. Think [Flipboard](flipboard.com) for RSS power-users.

In the spirit of [Google News](news.google.com), automated editorial will visually construct an information hierarchy, grouping articles in a way that feels intuitive, and improves reading. Hopefully we can meet [these criteria](https://news.ycombinator.com/item?id=12933006).

##### Todo: Bundling
* [X] Integrates with [Feedly](feedly.com)
* [X] Focus on unusual words (e.g. by low->high corpus frequency)
* [X] Identify similar tags (thesaurus, different forms of same word)
* [X] Remove bundles with only 1 article
* [X] Get reliable article URL from Feedly
* [X] Article snippets cut to 5 sentences
* [X] Order bundles by size
* [X] Dedupe article list (by title, url), favour higher engagement and shorter source name
* [ ] Identify specific topics / entities of articles
** https://nlp.stanford.edu/software/CRF-NER.shtml
** https://github.com/NaturalNode/natural#classifiers
* [ ] Group tags by overlap, develop venn diagram of (near) exclusive article groups => bundle
** Potentially something like neo4j, or some other on-the-go graphing (tags as nodes)
* [ ] ML takeover
** [ ] UI to drag-drop create/edit bundles
** [ ] ML network that learns bundling techniques, given { title, date, summary }

###### Classification reading
* https://en.wikipedia.org/wiki/Multi-label_classification
* https://www.researchgate.net/publication/276914825_Fuzzy_rule_classifiers_for_multi-label_classification
* https://stackoverflow.com/questions/14574462/news-article-categorization-subject-entity-analysis-via-nlp-preferably-in
* [leventshein](https://stackoverflow.com/a/42287748/1053937)
* [natural (NLP)](https://dzone.com/articles/using-natural-nlp-module)
* [node-svm](http://svmlight.joachims.org/)
* `naivebayesclassifier`

##### Todo: Presentation
* [X] Highlights notable stories - uses Feedly 'engagementRate'
* [X] Category-wide visual hierarchy
* [X] Display unbundled articles better
* [X] Random colour-coding for bundles
* [ ] Nav banner with current Stream name
* [ ] Animated server algo loading indicator
* [ ] Typographic experiments
** [ ] OS typeface option (white?)
** [ ] Paper type option (faded paper?)
* [X] Guardian-style horizontal/vertical blocks
** [X] Longest / most engaged bundles get multiple column
* [ ] Varied magazine-like layouts for long-scroll streams
* [ ] In-page article viewing

##### Todo: Technical
* [X] React Router for category IDs
* [ ] Move from inter-component CSS styling to ${props=>props} styled-components definitions
* [ ] Sockets.io post loading updates from algorithm
** [ ] Switch to genuine Progress-enabled promises - https://www.npmjs.com/package/deferred
* [ ] Switch to Redux centralised state
* [ ] React component performance profiling
** https://engineering.musefind.com/how-to-benchmark-react-components-the-quick-and-dirty-guide-f595baf1014c
** https://benchling.engineering/performance-engineering-with-react-e03013e53285
** https://benchling.engineering/a-deep-dive-into-react-perf-debugging-fd2063f5a667
* [ ] Multithreading, nonblocking, performance tweaking for multi instances of Node
** http://www.acuriousanimal.com/2017/08/12/understanding-the-nodejs-cluster-module.html
*** https://nodejs.org/api/cluster.html#cluster_cluster
** https://www.npmjs.com/package/memored
* [ ] Tests
* [ ] Handoff to non-node process? Python ML etc.

##### Todo: Live deployment
* [ ] Local storage for config
* [ ] Feedly app production keys
* [ ] Multiple Feedly users
* [ ] Find hosting
