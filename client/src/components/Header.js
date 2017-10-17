import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import EventListener, {withOptions} from 'react-event-listener';
import debounce from 'lodash.debounce';
import styled from 'styled-components';

const Logo = styled.div`
  user-select: none;
  transition: opacity 0.2s ease;
  opacity: 1;
  .sidebarOpen & { opacity: 0.2 }
  .sidebarOpen & .thenHide { opacity: 0 }
`

const FloatingHeader = styled.header`
	${({scrolledDown}) => (scrolledDown
		? // Initial state: delay appearance of box-shadow
		` transition: all 0.75s ease, box-shadow 1s ease 0.25s;
			box-shadow: 0 0 8px 2px rgba( 0, 0, 0, .2 );
		`:// Transitioned state: rapid box-shadow disappearance
		` transition: all 0.3s ease;
			box-shadow: 0 0 0 0 rgba( 0, 0, 0, 0 );
		`
	)};
`

export default class Header extends Component {
	constructor(props) {
		super(props)
		this.state = { scrolledDown: false }
	}

	componentWillUpdate = (props) => {
		this.mainScrollView = ReactDOM.findDOMNode(props.scrollRef)
	}

	handleScroll = (e) => {
		let el = this.mainScrollView;
		let scrollTop = el.scrollTop;
		console.log(scrollTop);
		this.setState({scrolledDown: scrollTop > 20})
	}

	render() {
		// Header big or small
		const titleContainerClasses = ' pt5 pb4 '
		const scrollConditionalClasses = this.state.scrolledDown ? ' pv3 ' : titleContainerClasses;
		const headerSmallClasses = ' fw9 f5 f4-ns f3-l ';
		const titleBigClasses = ' f1 fw3 tc ttc ';
		const conditionalTitleClasses = this.state.scrolledDown ? headerSmallClasses : titleBigClasses;

		return (
			<FloatingHeader
				scrolledDown={this.state.scrolledDown}
				className={'z-5 pa3 w-100 center flex flex-row fixed w-100 items-center bg-white '+scrollConditionalClasses}>
        {this.mainScrollView && <EventListener
          target={this.mainScrollView}
          onScroll={this.handleScroll}
        />}
				<Logo onClick={this.props.toggleSidebar} className={'pointer bg-white pa3 absolute top-0 left-0'+headerSmallClasses}>
					<span>{this.props.isSidebarOpen ? '✖︎' : '☰'}&nbsp;</span>
					<span className='thenHide'>RSSMAG</span>
				</Logo>
				<div className={'z-5 tc w-100 '+conditionalTitleClasses}
					style={{pointerEvents: 'none'}}>{this.props.streamLabel}</div>
			</FloatingHeader>
		)
	}
}
