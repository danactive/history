/* global GetGalleryNames */
const propTypes = require('prop-types');
const React = require('react');

/* eslint-disable jsx-a11y/tabindex-no-positive */
class GalleryDropdown extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      gallery: ''
    };

    this.galleryOptions = this.props.galleries.map((gallery) => {
      const id = `gallery-${gallery}`;
      return <option key={id} value={gallery}>{gallery}</option>;
    });

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange() {
    this.setState({
      gallery: this.value
    });
    GetGalleryNames();
  }

  render() {
    return (
      <section>
        Gallery
        <select id="editGalleries" tabIndex="1" onChange={this.handleChange}>
          <option key="gallery-none" value="">Select gallery</option>
          {this.galleryOptions}
        </select>
        <input type="button" id="changeGallery" value="View" />
      </section>
    );
  }
}

GalleryDropdown.propTypes = {
  galleries: propTypes.arrayOf(propTypes.string).isRequired
};

module.exports = GalleryDropdown;
