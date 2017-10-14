import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import 'tachyons';
import NewsArticle from './NewsArticle'

export default class NewsBundle extends Component {
  render() {
    let containerClassNames = this.props.column ? 'flex flex-column w-100 w-50-ns w-25-l bg-white' : 'w-100 bg-white';
    let listClassNames = this.props.column ? 'pa2 flex flex-column' : 'pa1 flex flex-wrap';

    return (
      <section className={containerClassNames} style={{outline: '1px solid #EEE'}}>
        {this.props.column ? (
          <header className='w-100 ph3 pt3'>
            <Link to={'/topic/'+encodeURIComponent(this.props.bundle.name)} className='link ttu fw9 f7 black-30'>{this.props.bundle.name}</Link>
          </header>
        ) : this.props.name ? (
          <header className='w-100 ph3 pb3 pt4 tc fw3 f3 black-50 lh-solid'>{this.props.name}</header>
        ) : false}
				<div className={listClassNames}>
					{this.props.bundle.articles.map((article,i) => (
            this.props.column ? (
              <NewsArticle column key={i} index={i} article={article} />
            ) : (
              <div key={i} className='w-100 w-50-ns w-25-l ph1 flex flex-column items-stretch'>
                <NewsArticle grid key={i} index={i} article={article} />
              </div>
            )
					))}
				</div>
			</section>
    );
  }
}
