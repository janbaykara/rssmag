import React, { Component } from 'react';
import 'tachyons';
import NewsArticle from './NewsArticle'

export default class NewsBundle extends Component {
  render() {
    return (
      <section className='flex flex-column w-100 w-50-ns w-25-l' style={{outline: '1px solid #CCC'}}>
				<div className='pa3'>
					{this.props.bundle.map((article,i) => (
						<NewsArticle key={i} index={i} article={article} />
					))}
				</div>
			</section>
    );
  }
}
