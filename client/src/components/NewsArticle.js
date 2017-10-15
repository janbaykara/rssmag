import React, { Component } from 'react';
import 'tachyons';
import Middot from './Middot'

export default class NewsArticle extends Component {
  render() {
		let { index, article } = this.props

		let date = new Date(article.published)

    // CSS
		let conditionalSeparator = this.props.grid ? ' bt b--near-white ' : ' ';
		let conditionalWidth =
      this.props.column
        ? this.props.substory
          ? ' substory w-100 w-50-ns ' : ' columnstory w-100 '
        : this.props.bigstory
          ? ' bigstory w-100 w-50-ns ' : ' gridstory w-100 w-50-m w-25-l ';

    let articleClasses = 'pa1 '+conditionalWidth+conditionalSeparator;

    return (
			<article className={articleClasses}>
				<a href={article.url} className='db h-100 link dim pointer bg-near-white black-80'>
					{(index === 0 && article.engagementRate > 1 && article.imageURL) && (
						<div className='cover w-100 h5 cover bg-black-10 mb2' style={{backgroundImage: `url(${article.imageURL})`}} />
					)}
					<div className='pa2'>
						{(index === 0 && article.engagementRate > 5) ? (
							<div className='fw9 f2 mb2'><span className='orange'>{article.engagementRate}</span> {article.title}</div>
						)
						:
						(index === 0 && article.engagementRate > 1) ? (
							<div className='fw4 f3 mb2'><span className='orange'>{article.engagementRate}</span> {article.title}</div>
						)
						:
						(index > 0 && article.engagementRate > 1) ? (
							<div className='fw5 f4 lh-title'><span className='orange'>{article.engagementRate}</span> {article.title}</div>
						)
						:
						(
							<div className='fw5 f5 lh-title'><span className='orange'>{article.engagementRate}</span> {article.title}</div>
						)}
						<div className='fw6 f7 black-30 mt1 lh-copy'>
							{article.source && <Middot className='black-40 bg-white ph1 br2 dib'>{article.source}</Middot>}
							{article.engagementRate > 1 && article.author && <Middot>{article.author}</Middot>}
							{article.published && <Middot>{date.toLocaleDateString('en-GB')}</Middot>}
						</div>
						{((index === 0 && article.engagementRate > 0.5) || this.props.bigstory) && (
							<p className='baskerville black-80 lh-title' style={{wordWrap: 'break-word'}}>{article.summary}</p>
						)}
					</div>
				</a>
			</article>
    );
  }
}
