import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import 'tachyons';
import diff from 'deep-diff';

const NoOverflowDiv = styled.div`
	/* No overflow */
	white-space: nowrap;
	overflow: hidden;

	/* Fade in-out */
	transition: opacity 0.2s ease;
	opacity: 0.5;
	.sidebarOpen & { opacity: 1 }
`

const UnselectableHeader = styled(NoOverflowDiv).attrs({
	className: 'pa3 pointer'
})`
	/* TODO: Move this to Tachyons extension */
	user-select: none;
`

export default class CategoriesNav extends Component {
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

	render() {
		return (
			<nav className='bg-black-90 near-white fixed top-0 left-0 h-100 w-100 overflow-y-auto'>
				<UnselectableHeader
					onClick={this.props.toggleSidebar}>
					<div className='fw9 f3'>RSSMAG</div>
					<div className='i orange'>Your Feedly categories</div>
				</UnselectableHeader>
				{this.props.categories ? (
				<ul className='list pa3'>
				{this.props.categories.map(cat => (
					<NoOverflowDiv key={cat.id} className='pointer mv2 pt1'>
						<Link
							onClick={this.props.toggleSidebar}
							to={'/category/'+encodeURIComponent(cat.id)}
							className='link white fw4 f5 dim'
							title={cat.description}>{cat.label}</Link>
						</NoOverflowDiv>
					))}
				</ul>) : <NoOverflowDiv className='moon-gray pa3 w-100 f3 fw9 pv4'>Loading categories</NoOverflowDiv>}
			</nav>
		)
	}
}
