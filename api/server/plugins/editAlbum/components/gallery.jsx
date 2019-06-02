/* global GetGalleryNames */
const React = require('react');

class GalleryDropdown extends React.Component {
  constructor(props) {
    super(props);

    const {
      galleries,
    } = props;

    this.galleryOptions = galleries.map((gallery) => {
      const id = `gallery-${gallery}`;
      return (
        <option key={id} value={gallery}>
          {gallery}
        </option>
      );
    });
  }

  render() {
    return (
      <section>
        Gallery
        <select id="editGalleries" tabIndex="1" onChange={GetGalleryNames}>
          <option key="gallery-none" value="">
            Select gallery
          </option>
          {this.galleryOptions}
        </select>
        <input type="button" id="changeGallery" value="View" />
      </section>
    );
  }
}

module.exports = GalleryDropdown;
