import React from 'react';
import { Link } from 'react-router-dom'
import styled from 'styled-components';
import 'tachyons';

const slideDuration = '0.15s';

const ModalBackground = styled.div`
&:before {
	content: '';
	background: #000000;
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 1;
	opacity: 0;
	transition: opacity ${slideDuration} ease;
	pointer-events: none;
}

.sidebarOpen > &:before {
	opacity: 0.3;
	pointer-events: inherit;
}
`;

const Sidebar = styled.div`
transition: all ${slideDuration} ease;

> * { opacity: 1; }

.sidebarClosed > & > * { opacity: 0.3; }

.sidebarClosed > & {
	width: 0;
	padding-left: 0;
	padding-right: 0;
	box-shadow: none;
}
`;

const NoOverflowDiv = styled.div`
white-space: nowrap;
overflow: hidden;
`

const UnselectableHeader = styled(NoOverflowDiv)`
user-select: none;
`

export default function CategoriesNav({categories, isOpen, toggleSidebar}) {
	return (
		<nav className={isOpen ? 'sidebarOpen' : 'sidebarClosed'}>
			<ModalBackground className='pointer' onClick={toggleSidebar} />
			<Sidebar className='bg-black-90 near-white z-3 fixed top-0 left-0 h-100 w-90 w-50-ns w-30-l h-100 shadow-2 overflow-y-auto'>
				<UnselectableHeader
					className='pa3 pointer'
					onClick={toggleSidebar}>
					<div className='fw9 f3'>RSSMAG</div>
					<div className='i'>Your Feedly categories</div>
				</UnselectableHeader>
				{categories ? (<ul className='list pa3'>
					{categories.map(cat => (
						<NoOverflowDiv key={cat.id} className='pointer dim mv2'>
							<Link
								onClick={toggleSidebar}
								to={'/'+encodeURIComponent(cat.id)}
								className='link white fw4 f5 '
								title={cat.description}>{cat.label}</Link>
							</NoOverflowDiv>
						))}
					</ul>) : <NoOverflowDiv className='moon-gray pa3 w-100 f3 fw9 pv4'>Loading categories</NoOverflowDiv>}
				</Sidebar>
			</nav>
		)
	}
