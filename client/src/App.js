import React, { Component } from 'react';
import {
  BrowserRouter as Router,
	Redirect,
  Route
} from 'react-router-dom'
import 'tachyons';
import CategoriesNav from './components/CategoriesNav'
import BundleView from './components/BundleView'

export default class App extends Component {
  constructor({match}) {
		console.log()
		super()
		this.state = {}
  }

  componentDidMount() {
    this.fetchCategories()
  }

  fetchCategories = () => {
    return fetch(`http://localhost:3000/api/feedly/categories`)
    .then(x => x.json())
    .then(x => this.setState({categories: x}))
    .catch(console.log)
  }

  render = () => {
    let defaultCategoryId = encodeURIComponent('user/3a94abfc-0869-47f0-9e7c-892608dd551c/category/Political Comment')
    return (
      <Router>
        <div>
          <CategoriesNav categories={this.state.categories} />
          <Route exact path='/' render={() => (
            <Redirect to={'/'+defaultCategoryId} />
          )} />
          <Route path='/:categoryId' render={(...args) => (
            <BundleView categories={this.state.categories} {...args} />
          )} />
        </div>
      </Router>
    )
  }
}
