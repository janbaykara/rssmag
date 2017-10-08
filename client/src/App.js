import React, { Component } from 'react';
import 'tachyons';
import CategoriesNav from './components/CategoriesNav'
import BundleView from './components/BundleView'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { }
  }

  componentDidMount() {
  	const streamId = 'user/3a94abfc-0869-47f0-9e7c-892608dd551c/category/Political Comment'; // Political Comment
  	// const streamId = 'user/3a94abfc-0869-47f0-9e7c-892608dd551c/category/World News' // World News
    this.fetchCategories();
    this.fetchStream(streamId);
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
        <CategoriesNav categories={this.state.categories} fetchStream={this.fetchStream} />
        <BundleView stream={this.state.stream} />
      </div>
    );
  }
}

export default App;
