import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route
} from 'react-router-dom'
import styled from 'styled-components';
import 'tachyons';
import CategoriesNav from './components/CategoriesNav'
import CategoryView from './components/CategoryView'

const UnselectableHeader = styled.header`
  user-select: none;
`

export default class App extends Component {
  constructor({match}) {
    console.log()
    super()
    this.state = {
      isSidebarOpen: false
    }
  }

  componentDidMount() {
    this.fetchCategories()
  }

  fetchCategories = () => {
    console.log("Loading categories")
    return fetch(`/api/feedly/categories`)
    .then(x => x.json())
    .then(x => this.setState({categories: x}))
    .catch(console.log)
  }

  toggleSidebar = () => {
    this.setState({isSidebarOpen: !this.state.isSidebarOpen})
  }

  render = () => {
    let defaultCategoryId = encodeURIComponent('user/3a94abfc-0869-47f0-9e7c-892608dd551c/category/Political Comment')
    return (
      <Router>
        <div>
          <Route exact path='/' render={() => (
            <Redirect to={'/'+defaultCategoryId} />
          )} />
          <CategoriesNav
            categories={this.state.categories}
            isOpen={this.state.isSidebarOpen}
            toggleSidebar={this.toggleSidebar}
          />
          <Route path='/:categoryId' render={(props) => (
            <div className='flex-l'>
              <UnselectableHeader onClick={this.toggleSidebar} className='w-100 w-10-l center ma0-l tc tl-l pa3 pointer'>
                <div className='fw9 f3'>RSSMAG</div>
                <div className='i'>Categories</div>
              </UnselectableHeader>
              <main className='w-100 w-80-l center ma0-l'>
                <CategoryView categories={this.state.categories} categoryId={props.match.params.categoryId} />
              </main>
            </div>
          )} />
        </div>
      </Router>
    )
  }
}
