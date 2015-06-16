import React, {Component, PropTypes} from "react"

import PostsList from "../PostsList"

export default class LatestPosts extends Component {

  static contextTypes = {
    i18n: PropTypes.object,
  }

  static propTypes = {
    posts: PropTypes.arrayOf(PropTypes.object),
  }

  render() {
    return (
      <div>
        <div className="r-Grid putainde-Section">
          <div className="r-Grid-cell r-all--8of12 putainde-Section-contents">
            <div className="putainde-Title putainde-Title--home">
              <h2 className="putainde-Title-text">
                {this.context.i18n.latestPosts}
              </h2>
            </div>
            <PostsList posts={this.props.posts} />
          </div>
        </div>
        <div className="r-Grid" style={{textAlign: "center"}}>
          <div className="r-Grid-cell r-all--8of12 ">
            <a href="/posts" className="putainde-Button putainde-Button--block">
            {this.context.i18n.morePosts}
            </a>
          </div>
        </div>
      </div>
    )
  }
}
