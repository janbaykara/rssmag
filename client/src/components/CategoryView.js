import React, { Component } from 'react';
import 'tachyons';
import NewsBundle from './NewsBundle';
import NewsArticle from './NewsArticle';

export default class CategoryView extends Component {
	constructor(props) {
		super(props)
		this.state = { initiated: false }
	}

	// On router new category
	componentWillReceiveProps = (nextProps) => {
		if(this.state.initiated && this.props[0].match.params.categoryId === nextProps[0].match.params.categoryId) return false;

		const categoryId = decodeURIComponent(nextProps[0].match.params.categoryId)
		this.setState({
			initiated: true,
			path: nextProps[0].match.path,
			params: nextProps[0].match.params,
			stream: null,
			categoryId: categoryId,
			categoryLabel: nextProps.categories.length ? nextProps.categories.find(c => c.id === categoryId).label : /category\/(.*)$/ig.exec(categoryId)[1] // Extract name from id string
		})

		this.fetchStream(categoryId)
	}

  fetchStream = (categoryId) => {
    this.setState({ stream: null })
    return fetch(`http://localhost:3000/api/bundle/${encodeURIComponent(categoryId)}/100`)
    .then(x => x.json())
    .then(x => this.setState({stream: x}))
    .catch(console.log)
  }

	render = () => {
		return (
			<main>
				<header className='f1 fw3 mv4 tc'>{this.state.categoryLabel}</header>
				<div className='flex flex-wrap items-start items-stretch pa3 pt0'>
					{this.state.stream ? this.state.stream.bundles.map(bundle =>
						(bundle.articles.length > 0 &&
							<NewsBundle
								key={bundle.name}
								bundle={bundle} />)
					): <div className='tc moon-gray w-100 pa7 f1 fw9'>Loading articles</div>}
					{this.state.stream && this.state.stream.unbundled.map((a,i) => (
						<div key={i} className='w-100 w-50-ns w-25-l pa1 flex flex-column items-stretch'>
							<NewsArticle index={i} article={a} />
						</div>
					))}
				</div>
			</main>
		)
	}
}
