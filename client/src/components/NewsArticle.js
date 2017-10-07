import React, { Component } from 'react';
import 'tachyons';
import styled from 'styled-components';

const Middot = styled.span`
	& + &:before {
		content: " \00b7  ";
	}
`

export default class NewsArticle extends Component {
  render() {
		let { index, article } = this.props

		let date = new Date(article.published)
		let articleClasses = (!article.engagementRate || article.engagementRate <= 1) ? 'pv1 bt b--near-white' : 'pv1'

    return (
      <article className={articleClasses}>
				<a href={article.url} className='link black glow'>
					{(index === 0 && article.engagementRate > 1 && article.visual) && (
						<div className='cover w-100 h5 cover bg-near-white mb2' style={{backgroundImage: `url(${article.visual.url})`}} />
					)}
					{(index === 0 && article.engagementRate > 1) && (
						<div className='fw1 f2 lh-title'>{article.title}</div>
					)}
					{(index > 0 && article.engagementRate > 1) && (
						<div className='fw5 f4 lh-title'>{article.title}</div>
					)}
					{(!article.engagementRate || article.engagementRate <= 1) && (
						<div className='fw5 f5 lh-title'>{article.title}</div>
					)}
					{(index === 0 || article.engagementRate > 1) && (
						<div className='fw6 f7 black-40 mt1'>
							{article.source && <Middot className='white bg-black-30 pa1 br2 lh-copy'>{article.source}</Middot>}
							{article.author && <Middot>{article.author}</Middot>}
							{article.published && <Middot>{date.toLocaleDateString('en-GB')}</Middot>}
						</div>
					)}
					{(index === 0 && article.engagementRate > 0.5) && (
						<p className='baskerville black-70 lh-copy' style={{wordWrap: 'break-word'}}>{article.summary}</p>
					)}
				</a>
			</article>
    );
  }
}
