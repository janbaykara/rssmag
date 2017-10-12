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

const Logo = styled.header.attrs({
  className: 'w-100 w-10-l center ma0-l tc tl-l pa3 pointer'
})`
  user-select: none;
  transition: opacity 0.2s ease;
  opacity: 1;
  .sidebarOpen & { opacity: 0.2 }
  .sidebarOpen & .thenHide { opacity: 0 }
`

const SlideRevealWindow = styled.div.attrs({
  className: 'absolute bg-white flex-l'
})`
  width: 100vw;
  height: 100vh;
  overflow: auto;
  transition: left 0.3s ease;
  left: 0%;

  .sidebarOpen & {
    cursor: pointer;
    left: 85%;
    @media (min-width: 30em) { left: 40%; }
    @media (min-width: 60em) { left: 25%; }
    @media (min-width: 80em) { left: 20%; }

    * { pointer-events: none; }
  }
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
        <div className={this.state.isSidebarOpen ? 'sidebarOpen' : 'sidebarClosed'}>
          <Route exact path='/' render={() => (
            <Redirect to={'/'+defaultCategoryId} />
          )} />
          <CategoriesNav
            categories={this.state.categories}
            toggleSidebar={this.toggleSidebar}
          />
          <Route path='/:categoryId' render={(props) => (
            <SlideRevealWindow onClick={this.state.isSidebarOpen ? this.toggleSidebar : null}>
              <Logo onClick={this.toggleSidebar}>
                <span className='fw9 f3'>{this.state.isSidebarOpen ? '✖︎' : '☰'}&nbsp;</span>
                <span className='fw9 f3 thenHide'>RSSMAG</span>
              </Logo>
              <main className='w-100 w-80-l center ma0-l'>
                <CategoryView categories={this.state.categories} categoryId={props.match.params.categoryId} />
              </main>
            </SlideRevealWindow>
          )} />
        </div>
      </Router>
    )
  }
}
