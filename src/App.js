import axios from 'axios';
import React from 'react';

const URL = 'http://my.api.com/stories';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      stories: [],
      error: null,
    };
  }

  componentDidMount() {
    this.fetchStories();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.query !== this.props.query) {
      this.fetchStories();
    }
  }

  setStories = (stories) => {
    this.setState({ ...this.state, stories });
  };

  setError = (error) => {
    this.setState({ ...this.state, error });
  };

  fetchStories = () => {
    axios
      .get(`${URL}?query=${encodeURI(this.props.query)}`)
      .then((response) => {
        this.setStories(response.body.stories);
      })
      .catch((error) => {
        this.setError(error);
      });
  };

  render() {
    return (
      <div>
        <button type="button" onClick={this.fetchStories}>
          Fetch Stories
        </button>

        {this.state.error && (
          <span data-testid="error">{this.state.error.message}</span>
        )}

        <ul>
          {this.state.stories.map((story) => (
            <li key={story.id}>
              <a href={story.url}>{story.title}</a>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
