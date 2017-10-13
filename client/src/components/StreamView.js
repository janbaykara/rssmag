import React, { Component } from 'react';
import 'tachyons';
import diff from 'deep-diff';
import io from 'socket.io-client';
import AnimatedNumber from 'react-animated-number';
import NewsBundle from './NewsBundle';
import NewsArticle from './NewsArticle';

export default class StreamView extends Component {
	constructor(props) {
		super(props)
		this.state = { stream: null, loadingPercent: 0, loadingMessage: '' }
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

	// shouldComponentUpdate(nextProps,nextState) {
	// 	const propDiff = diff(this.props, nextProps)
	// 	const stateDiff = diff(this.state, nextState)
	// 	// console.log("PROP",propDiff)
	// 	// console.log("STATE",stateDiff)
	// 	if(propDiff !== undefined || stateDiff !== undefined) {
	// 		// console.log("✅ Updating!")
	// 		return true;
	// 	} else {
	// 		// console.log("❌ Not updating!")
	// 		return false;
	// 	}
	// }

	fetchStream = (type, id) => {
		switch(type) {
			case 'category': this.fetchCategory(id); break;
			case 'topic': this.fetchTopic(id); break;
			default: return false;
		}
	}

  fetchCategory = (categoryId) => {
		const socket = io('http://localhost:3001/api/bundle');
		const fetchId = categoryId+'/'+(new Date()).getTime()
    this.setState({stream: null, loadingPercent: 0});
		socket.emit('request', {
			fetchId,
			n: 200,
			mode: 'streamed',
			streamId: categoryId
		});
		socket.on(`progress#${fetchId}`, progress => {
			// console.log("LOADING", progress.loadingPercent)
			this.setState(progress)
	  });
		socket.on(`response#${fetchId}`, (d) => {
			this.setState({stream: d, loadingPercent: 1})
		});
  }

  fetchTopic = (topicName) => {
    this.setState({stream: null})
    return fetch(`/api/bundle/100/mixed/articles/${encodeURIComponent(`topic/${topicName}`)}`)
    .then(x => x.json())
    .then(x => this.setState({stream: x}))
    .catch(console.log)
  }

	render = () => {
		const streamId = decodeURIComponent(this.props.streamId)
		const streamLabel = this.props.type === 'category' && this.props.categories && this.props.categories.length > 0 ? this.props.categories.find(c => c.id === streamId).label : idToName(streamId, this.props.type) // Extract name from id string

		return [
			<header key='header' className='f1 fw3 mv4 tc ttc'>{streamLabel}</header>,
			<div key='body' className='flex flex-wrap items-start items-stretch pa3 pt0'>
				{this.state.stream ? this.state.stream.articles.bundles.map(bundle =>
				(bundle.articles.length > 0 &&
					<NewsBundle
						key={bundle.name}
						bundle={bundle}
					 	fetchTopic={this.fetchTopic}
					/>)
				):
				<div className='tc moon-gray w-100 pa3 pa7-l'>
					<div className='f1 fw9'><AnimatedNumber value={this.state.loadingPercent} stepPrecision={0} formatValue={n=>n.toFixed(0)}/>% loaded</div>
					<span className='i f3'>{this.state.loadingMessage}</span>
				</div>
				}
				{this.state.stream && this.state.stream.articles.unbundled.map((a,i) => (
					<div key={i} className='w-100 w-50-ns w-25-l pa1 flex flex-column items-stretch'>
						<NewsArticle index={i} article={a} />
					</div>
				))}
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
