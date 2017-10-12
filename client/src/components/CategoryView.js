import React, { Component } from 'react';
import 'tachyons';
import NewsBundle from './NewsBundle';
import NewsArticle from './NewsArticle';
import diff from 'deep-diff'

export default class CategoryView extends Component {
	constructor(props) {
		super(props)
		this.state = { stream: null }
	}

	componentDidMount() {
		this.fetchStream(this.props.categoryId)
	}

	// On router new category
	componentWillReceiveProps = (nextProps) => {
		if(this.props.categoryId !== nextProps.categoryId) {
			// console.log(`🌼🌼 ${idToName(decodeURIComponent(this.props.categoryId))} => ${idToName(decodeURIComponent(nextProps.categoryId))}`)
			this.fetchStream(nextProps.categoryId)
		}
	}

	shouldComponentUpdate(nextProps,nextState) {
		const propDiff = diff(this.props, nextProps)
		const stateDiff = diff(this.state, nextState)
		// console.log("PROP",propDiff)
		// console.log("STATE",stateDiff)
		if(propDiff !== undefined || stateDiff !== undefined) {
			// console.log("✅ Updating!")
			return true;
		} else {
			// console.log("❌ Not updating!")
			return false;
		}
	}

  fetchStream = (categoryId) => {
		categoryId = decodeURIComponent(categoryId)
		// console.log("Loading "+categoryId)
    this.setState({stream: null})
    return fetch(`/api/bundle/${encodeURIComponent(categoryId)}/100`)
    .then(x => x.json())
    .then(x => this.setState({stream: x}))
    .catch(console.log)
  }

	render = () => {
		const categoryId = decodeURIComponent(this.props.categoryId)
		const categoryLabel = this.props.categories && this.props.categories.length > 0 ? this.props.categories.find(c => c.id === categoryId).label : /category\/(.*)$/ig.exec(categoryId)[1] // Extract name from id string

		return [
			<header key='header' className='f1 fw3 mv4 tc'>{categoryLabel}</header>,
			<div key='body' className='flex flex-wrap items-start items-stretch pa3 pt0'>
				{this.state.stream ? this.state.stream.bundles.map(bundle =>
					(bundle.articles.length > 0 &&
						<NewsBundle
							key={bundle.name}
							bundle={bundle} />)
				): <div className='tc moon-gray w-100 pa3 pa7-l f1 fw9'>Loading articles</div>}
				{this.state.stream && this.state.stream.unbundled.map((a,i) => (
					<div key={i} className='w-100 w-50-ns w-25-l pa1 flex flex-column items-stretch'>
						<NewsArticle index={i} article={a} />
					</div>
				))}
			</div>
		]
	}
}
