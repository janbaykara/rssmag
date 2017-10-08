import React, { Component } from 'react';
import 'tachyons';
import NewsBundle from './components/NewsBundle'
import NewsArticle from './components/NewsArticle'
import Middot from './components/Middot'

// fetch

class App extends Component {
  constructor(props) {
    super(props)

    this.state = { }

  	const streamId = 'user/3a94abfc-0869-47f0-9e7c-892608dd551c/category/Political Comment'; // Political Comment
  	// const streamId = 'user/3a94abfc-0869-47f0-9e7c-892608dd551c/category/World News' // World News
    this.fetchCategories()
    this.fetchStream(streamId)
  }

  fetchCategories = () => {
    return fetch(`http://localhost:3000/api/feedly/categories`)
    .then(x => x.json())
    .then(x => this.setState({categories: x}))
    .catch(console.log)
  }

  fetchStream = (streamId) => {
    this.setState({stream: null})
    return fetch(`http://localhost:3000/api/bundle/${encodeURIComponent(streamId)}/100`)
    .then(x => x.json())
    .then(x => this.setState({stream: x}))
    .catch(console.log)
  }

  render() {
    return (
      <div>
        <header className='w-100 pa3'>
          <div className='fw9 f3'>RSSMAG</div>
          <nav>{
            this.state.categories ? this.state.categories.map(cat => (
              <Middot className='fw6 f5 pa2 dib pointer dim'><a key={cat.id}
                className='link'
                onClick={(e) => this.fetchStream(cat.id)}
                title={cat.description}>{cat.label}</a></Middot>
            )) : <div className='tc moon-gray w-100 f3 fw9'>Loading</div>
          }</nav>
        </header>
        <main className='flex flex-wrap items-start items-stretch pa3'>
          {this.state.stream ? this.state.stream.bundles.map(bundle =>
            (bundle.articles.length > 0 &&
              <NewsBundle
                key={bundle.name}
                bundleName={bundle.name}
                bundle={bundle.articles} />)
          ): <div className='tc moon-gray w-100 pa7 f1 fw9'>Loading</div>}
          {this.state.stream && this.state.stream.unbundled.map((a,i) => (
						<NewsArticle key={i} index={i} article={a} />
          ))}
        </main>
      </div>
    );
  }
}

export default App;
