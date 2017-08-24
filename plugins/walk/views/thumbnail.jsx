const propTypes = require('prop-types');
const React = require('react');

// eslint-disable-next-line react/prefer-stateless-function
class Thumbnail extends React.Component {
  // todo fetch service call to generate thumbnail, not just small dimensions; remove above lint disable
  // componentDidMount() {
  //   this.setState({ imgPath: `http://localhost:8000/static/gallery-demo/media/photos/lots/${this.props.filename}` });
  // }

  render() {
    const imgPath = `http://localhost:8000/static/gallery-demo/media/photos/lots/${this.props.filename}`;
    return (<li><img src={imgPath} alt="Preview small dimensions" width="200" height="150" /></li>);
  }
}

Thumbnail.propTypes = {
  filename: propTypes.string.isRequired
};

module.exports = Thumbnail;
