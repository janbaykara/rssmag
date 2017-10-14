import React, { Component } from 'react';
import 'tachyons';
import NewsBundle from './NewsBundle';
import NewsArticle from './NewsArticle';
import diff from 'deep-diff';

export default class StreamView extends Component {
	constructor(props) {
		super(props)
		this.state = { stream: null }
	}

	componentDidMount() {
		this.fetchStream(this.props.type, this.props.streamId)
	}

	// On router new category
	componentWillReceiveProps = (nextProps) => {
		if(this.props.streamId !== nextProps.streamId) {
			// console.log(`🌼🌼 ${idToName(decodeURIComponent(this.props.streamId))} => ${idToName(decodeURIComponent(nextProps.streamId))}`)
			this.fetchStream(nextProps.type, nextProps.streamId)
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

	fetchStream = (type, id) => {
		let url;

		switch(type) {
			case 'category': url = `/api/bundle/200/streamed/articles/${encodeURIComponent(id)}`; break;
			case 'topic': url = `/api/bundle/100/mixed/articles/${encodeURIComponent(`topic/${id}`)}`; break;
			default: return false;
		}

    return fetch(url)
	    .then(x => x.json())
	    .then(x => this.setState({stream: x}))
	    .catch(console.log)
	}


  }

	render = () => {
		const streamId = decodeURIComponent(this.props.streamId)
		const streamLabel = this.props.type === 'category' && this.props.categories && this.props.categories.length > 0 ? this.props.categories.find(c => c.id === streamId).label : idToName(streamId, this.props.type) // Extract name from id string

		return [
			<header key='header' className='f1 fw3 mv4 tc ttc'>{streamLabel}</header>,
			<div key='body' className='flex flex-wrap items-start items-stretch pa3 pt0'>
				{this.state.stream ? [
					this.state.stream.articles.bundles.map(bundle => (
						(bundle.articles.length > 0 && bundle.name !== '__unbundled') && (
							<NewsBundle
								column
								key={bundle.name+bundle.articles.length}
								bundle={bundle}
							 	fetchTopic={this.fetchTopic}
							/>
						)
					)),
					<NewsBundle
						grid
						key='unbundled'
						name={'Also in '+streamLabel}
						bundle={this.state.stream.articles.bundles.find(b=>b.name === '__unbundled')}
					/>
				] : <div className='tc moon-gray w-100 pa3 pa7-l f1 fw9'>Loading articles</div>}
			</div>
		]
	}
}

function idToName(id,type) {
	switch(type) {
		case 'category':
			var matches = /category\/(.*)$/ig.exec(id);
			return matches ? matches[1] : null;
		case 'topic':
			return `Topic: ${id}`;
		default:
			return '';
	}
}
