import React, { Component } from 'react';
import 'tachyons';
import NewsBundle from './NewsBundle';
import diff from 'deep-diff';

export default class StreamView extends Component {
	constructor(props) {
		super(props)
		this.state = { stream: null }
	}

	componentDidMount() {
		this.fetchStream(this.props.streamType, this.props.streamId)
	}

	// On router new category
	componentWillReceiveProps = (nextProps) => {
		if(this.props.streamId !== nextProps.streamId) {
			// console.log(`🌼🌼 ${idToName(decodeURIComponent(this.props.streamId))} => ${idToName(decodeURIComponent(nextProps.streamId))}`)
			this.fetchStream(nextProps.streamType, nextProps.streamId)
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
		this.setState({stream: null})

		let url;

		switch(type) {
			case 'category': url = `/api/bundle/200/streamed/articles/${encodeURIComponent(id)}`; break;
			case 'topic': url = `/api/bundle/200/mixed/articles/${encodeURIComponent(`topic/${id}`)}`; break;
			default: return false;
		}

    return fetch(url)
	    .then(x => x.json())
	    .then(x => this.setState({stream: x}))
	    .catch(console.log)
	}


  }

	render = () => {
		return (
			<div key='body' className='flex flex-wrap items-start items-stretch pa3 pt0'>
				{this.state.stream ? [
					this.state.stream.articles.bundles.map(bundle => (
						(bundle.articles.length > 0 && bundle.name !== '__unbundled') && (
							<div key={bundle.name} className={isFeatured(bundle) ? 'w-100 w-50-ns' : 'w-100 w-50-ns w-25-l'}>
								<NewsBundle
									column
									feature={isFeatured(bundle)}
									key={bundle.name+bundle.articles.length}
									bundle={bundle}
								 	fetchTopic={this.fetchTopic}
								/>
							</div>
						)
					)),
					<div key='__unbundled' className='w-100'>
						<NewsBundle
							grid
							key='unbundled'
							name={'Also in '+this.props.streamLabel}
							bundle={this.state.stream.articles.bundles.find(b=>b.name === '__unbundled')}
						/>
					</div>
				] : <div className='tc moon-gray w-100 pa3 pa7-l f1 fw9'>Loading articles</div>}
			</div>
		)
	}
}

function isFeatured(bundle) {
	return Boolean((
		// Fancy looking important articles
			bundle.articles[0].imageURL
			&& bundle.articles[0].summary
			&& bundle.articles[0].engagementRate > 1
			&& bundle.avgEngagementRate > 0.5
			&& bundle.articles.length >= 3
		) // Or just loads.
		|| bundle.articles.length >= 7)
}
