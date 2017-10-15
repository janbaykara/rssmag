import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import 'tachyons';
import NewsArticle from './NewsArticle'

export default class NewsBundle extends Component {
  render() {
    return (
      <section className='h-100 bg-white' style={{outline: '1px solid #EEE'}}>
        {this.props.name ? (
          // Big header
          <header className='w-100 ph3 pb3 pt4 tc fw3 f3 black-50 lh-solid'>{this.props.name}</header>
        ) : this.props.bundle.name ? (
          // Little header
          <header className='w-100 ph3 pt3'>
            <Link to={'/topic/'+encodeURIComponent(this.props.bundle.name)} className='link ttu fw9 f7 black-30'>{this.props.bundle.name}</Link>
          </header>
          // Or nothing
        ) : false}
				<div className='pa1 flex flex-wrap'>
					{this.props.bundle.articles.map((article,i) => (
            <NewsArticle key={i} index={i} article={article}
              column={this.props.column}
              grid={this.props.grid}
              bigstory={Boolean(
                this.props.grid
                && article.engagementRate > 1
                && (article.imageURL || article.summary)
              )}
              substory={Boolean(
                this.props.feature
                && article.engagementRate <= 5
                && !((article.imageURL || article.summary) && i == 0)
              )} />
					))}
				</div>
			</section>
    );
  }
}
