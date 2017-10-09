import React from 'react';
import { Link } from 'react-router-dom'
import 'tachyons';

export default function CategoriesNav({categories, pickCategory}) {
	return (
		<header className='w-100 pa3 pb0 mb2'>
				<span className='fw9 f3 v-mid dib mr1 mb1'>RSSMAG</span>
				{
				categories ? categories.map(cat => (
					<span
						key={cat.id}
						className='v-mid fw6 f6 pa2 dib pointer dim bg-black-10 black-80 br2 mr1 mb1'>
						<Link
							to={'/'+encodeURIComponent(cat.id)}
							className='link'
							title={cat.description}>{cat.label}</Link>
					</span>
				)) : <div className='tc moon-gray w-100 f3 fw9'>LOADING</div>
				}
		</header>
	)
}
