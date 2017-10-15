import React from 'react';
import 'tachyons';
import Middot from './Middot'

export default function NewsArticle(props) {
	let { index, article } = props

	let date = new Date(article.published)

  // CSS
	let conditionalSeparator = props.grid ? ' bt b--near-white ' : ' ';

  let layoutType =
    props.column
      ? props.substory
        ? 'substory' : 'columnstory'
      : props.grid && props.bigstory
        ? 'biggridstory' : 'gridstory';

  let conditionalWidth;
  switch(layoutType) {
    case 'columnstory': conditionalWidth = ' w-100 ';
      break;
    case 'substory': conditionalWidth = ' w-100 w-50-l ';
      break;
    case 'biggridstory': conditionalWidth = ' w-100 w-50-ns ';
      break;
    case 'gridstory': conditionalWidth = ' w-100 w-50-m w-25-l ';
      break;
    default:
      conditionalWidth = ' w-100 '
  }

  // CSS for horizontal [ title | image ]
  let showImage = index === 0 && article.engagementRate > 1 && article.imageURL;
  let showSummary = article.summary && ((index === 0 && article.engagementRate > 0.5) || props.bigstory);
  let horizontalLayout = Boolean(
    props.bigstory
    && (layoutType === 'columnstory' || layoutType === 'biggridstory')
    && showSummary
    && showImage
    && article.engagementRate > 2
    && (layoutType === 'biggridstory' ? Math.random() > 0.3 : Math.random() > 0.5)
  )
  // Randomly decide the order of horizontal [ image | title ] articles
  let imgOrder = Math.random() > 0.5 ? ' order-1 ' : '';

  let titleClasses = (index === 0 && article.engagementRate > 5) ? 'fw9 f2 mb2'
                  : (index === 0 && article.engagementRate > 1) ? 'fw4 f3 mb2'
                  : (index > 0 && article.engagementRate > 1) ? 'fw5 f4 lh-title'
                  : 'fw5 f5 lh-title';

  return (
		<article className={'pa1 bg-white '+conditionalWidth+conditionalSeparator}>
			<a href={article.url} className={'overflow-hidden bl db h-100 link dim pointer bg-near-white black-80 '+(horizontalLayout ? ' flex-l flex-row-l ' : '')}
        style={{borderColor: props.themeColour}}>
				{showImage && (
					<div className={'cover cover bg-black-10 mb2 '+(horizontalLayout ? ' w-50-l h-100-l '+imgOrder : ' w-100 h5 ')}
            style={{backgroundImage: `url(${article.imageURL})`}} />
				)}
				<div className={'pa2 '+(horizontalLayout ? ' w-50-l ' : ' w-100 ')}>
					<header className={titleClasses}>
            <span className='orange'>{article.engagementRate}</span>
            <span className='black-10 fw1'>/</span>
            <span>{article.title}</span>
          </header>
					<div className='fw6 f7 black-30 mt1 lh-copy'>
						{article.source && <Middot className='black-40 bg-white ph1 br2 dib'>{article.source}</Middot>}
						{article.engagementRate > 1 && article.author && <Middot>{article.author}</Middot>}
						{article.published && <Middot>{date.toLocaleDateString('en-GB')}</Middot>}
					</div>
					{showSummary && <p className='baskerville black-60 lh-title mw6' style={{wordWrap: 'break-word'}}>{article.summary}</p>}
				</div>
			</a>
		</article>
  );
}
