import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import Posts from "./components/Posts";
import PostPage from "./components/PostPage";
import Form from "./components/Form";
import About from "./components/About";
import SiteHeader from "./components/SiteHeader";
import "./bootstrap.css";
import {getPosts, getComments, getVoteCounters} from "./utils/tronweb";

class App extends Component {
  
  constructor () {
    super();
    this.state = [{
      posts : [],
      postData : getPosts(),
      commentData: getComments()
    }]
    getVoteCounters()
  }

  render() {
    return (
      <Router>   
      <div className="App">
        <div class="container">
          <SiteHeader />

          <div className="FormArea">
          <Route path="/new-post" component={newpost} />
          </div>

          <Route path="/" exact component={Home} />

          <Route path="/about" component={AboutP} />

          <Route path="/post=:id" component={PostP}/>

        </div>
      </div>
      </Router>
    );
  }
}

const Home = () => <Posts />;
const newpost = () => <Form /> ;
const PostP = ({ match }) => ( <PostPage postid={match.params.id} />);
const AboutP = ({ match }) => ( <About />);

export default App;
