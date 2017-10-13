import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import 'tachyons';
import NewsArticle from './NewsArticle'

export default class NewsBundle extends Component {
  render() {
    return (
      <section className='flex flex-column w-100 w-50-ns w-25-l bg-white' style={{outline: '1px solid #EEE'}}>
        <header className='w-100 ph3 pt3'>
          <Link to={'/topic/'+encodeURIComponent(this.props.bundle.name)} className='link ttu fw9 f7 black-30'>{this.props.bundle.name}</Link>
        </header>
				<div className='pa2'>
					{this.props.bundle.articles.map((article,i) => (
						<NewsArticle key={i} index={i} article={article} />
					))}
				</div>
			</section>
    );
  }
}
