import React, { Component } from 'react';
import 'tachyons';
import NewsBundle from './components/NewsBundle'
import Loading from './components/Loading'

// fetch

class App extends Component {
  constructor(props) {
    super(props)

    this.state = { }

  	const streamId = 'user/3a94abfc-0869-47f0-9e7c-892608dd551c/category/Political Comment'; // Political Comment
  	// const streamId = 'user/3a94abfc-0869-47f0-9e7c-892608dd551c/category/World News' // World News
    fetch(`http://localhost:3000/api/bundle/${encodeURIComponent(streamId)}/100`)
    .then(x => x.json())
    .then(x => this.setState({collection: x}))
    .catch(console.log)
  }

  render() {
    return (
      <div>
        <header className='w-100'>
          <div className='b f3 fw9 pa3'>RSSMAG</div>
        </header>
        <main className='flex flex-wrap items-start items-stretch pa3'>
          {this.state.collection ? Object.keys(this.state.collection).map(bundle =>
            (this.state.collection[bundle].length > 0 && <NewsBundle key={bundle} bundle={this.state.collection[bundle]} />)
          ): <Loading />}
        </main>
      </div>
    );
  }
}

export default App;
