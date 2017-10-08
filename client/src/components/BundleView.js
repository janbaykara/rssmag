import React from 'react';
import 'tachyons';
import NewsBundle from './NewsBundle';
import NewsArticle from './NewsArticle';

export default function BundleView({stream}) {
	return (
		<main className='flex flex-wrap items-start items-stretch pa3 pt0'>
			{stream ? stream.bundles.map(bundle =>
				(bundle.articles.length > 0 &&
					<NewsBundle
						key={bundle.name}
						bundleName={bundle.name}
						bundle={bundle.articles} />)
			): <div className='tc moon-gray w-100 pa7 f1 fw9'>Loading</div>}
			{stream && stream.unbundled.map((a,i) => (
				<div key={i} className='w-100 w-50-ns w-25-l pa1 flex flex-column items-stretch'>
					<NewsArticle index={i} article={a} />
				</div>
			))}
		</main>
	)
}
