import React, { Component } from 'react';
import 'tachyons';
import Loading from './components/Loading'
import NewsBundle from './components/NewsBundle'
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
            )) : <Loading />
          }</nav>
        </header>
        <main className='flex flex-wrap items-start items-stretch pa3'>
          {this.state.stream ? Object.keys(this.state.stream).map(bundle =>
            (this.state.stream[bundle].length > 0 &&
              <NewsBundle
                key={bundle}
                bundleName={bundle}
                bundle={this.state.stream[bundle]} />)
          ): <Loading />}
        </main>
      </div>
    );
  }
}

export default App;
