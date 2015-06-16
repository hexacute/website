import React, {Component, PropTypes} from "react"

import getAuthorUri from "../getAuthorUri"

export default class AuthorsList extends Component {

  static contextTypes = {
    contributors: PropTypes.object,
    i18n: PropTypes.object,
  }

  static propTypes = {
    authors: PropTypes.arrayOf(PropTypes.string).isRequired,
  }

  render() {
    const authors = this.props.authors
    return (
      <span>
      {
        authors.map((authorKey, index) => {
          const author = this.context.contributors.getContributor(authorKey)
          let glue = ""
          // 2 authors or more : X, Y and Z
          if (authors.length > 1 && index === authors.length - 2) {
            glue = " et "
          }
          else if (index !== authors.length - 1) {
            glue = ", "
          }
          return (
            [
              <a key={author} href={getAuthorUri(author)}>
                {author.login}
              </a>,
              <span key={`${author}-glue`}>{glue}</span>,
            ]
          )
        })
      }
      </span>
    )
  }
}
