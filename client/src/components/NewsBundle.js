import React from 'react';
import { Link } from 'react-router-dom';
import 'tachyons';
import NewsArticle from './NewsArticle';
import ColorHash from 'color-hash';

const colorHash = new ColorHash({
  saturation: 1,
  lightness: 0.4
});

export default function NewsBundle(props) {
  let bundleColour = props.bundle.name === '__unbundled' ? 'rgba(0,0,0,0.2)' : colorHash.hex(props.bundle.name);

  return (
    <section className='h-100 bg-white' style={{outline: '1px solid #EEE'}}>
      {props.name ? (
        // Big header
        <header className='w-100 ph3 pb3 pt4 tc fw3 f3 black-50 lh-solid'>{props.name}</header>
      ) : props.bundle.name ? (
        // Little header
        <header className='w-100 ph3 pt2'>
          <Link to={'/topic/'+encodeURIComponent(props.bundle.name)} className='link ttu fw9 f7 black-30'>{props.bundle.name}</Link>
        </header>
        // Or nothing
      ) : false}
			<div className='pa1 flex flex-wrap'>
				{props.bundle.articles.map((article,i) => (
          <NewsArticle key={i} index={i} article={article}
            themeColour={bundleColour}
            column={props.column}
            grid={props.grid}
            bigstory={Boolean((
              props.feature
              && i === 0
            ) || (
              props.grid
              && article.engagementRate > 1
              && (article.imageURL || article.summary)
            ))}
            substory={Boolean(
              props.feature
              && article.engagementRate <= 5
              && !((article.imageURL || article.summary) && i === 0)
            )} />
				))}
			</div>
		</section>
  );
}
