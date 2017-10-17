import React, { Component } from 'react';
import StreamView from './StreamView';
import Header from './Header';

/**
	* @param {Boolean} props.toggleSidebar
	* @param {Boolean} props.isSidebarOpen
	* @param {Object}  props.categories
	* @param {String}  props.streamType
	* @param {String}  props.streamId
*/
export default class ReaderRoute extends Component {
	render() {
		const props = this.props;

    // Stream name (category/topic)
		const streamId = decodeURIComponent(props.streamId);
		const streamLabel = props.streamType === 'category' && props.categories && props.categories.length > 0
			? props.categories.find(c => c.id === streamId).label
			: idToName(streamId, props.streamType); // Extract name from id string

    // CSS
		const titleContainerClasses = ' pt5 pb4 '
		const titleBigClasses = ' f1 fw3 tc ttc pa3 ';

		return (
			<div className='w-100'>
				<Header
          scrollRef={props.scrollRef}
          toggleSidebar={props.toggleSidebar}
          isSidebarOpen={props.isSidebarOpen}
          streamLabel={streamLabel} />
				<main className='w-100 w-80-l center'>
					{/* Duplicate the header so the floating one never spills over the content */}
					<div className={'o-0 tc w-100 mb3'+titleBigClasses+titleContainerClasses}>{streamLabel}</div>
					<StreamView
						streamType={props.streamType}
						streamId={decodeURIComponent(props.streamId)}
						streamLabel={streamLabel}
					/>
				</main>
			</div>
		)
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
