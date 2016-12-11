const React = require('react');

/* eslint-disable jsx-a11y/tabindex-no-positive */
function Page(props) {
  return (
    <html lang="en">
      <head>
        <title>History</title>
        <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
        <link rel="stylesheet" href="./album/static/lib/fluid960gs-reset.css" />
        <link rel="stylesheet" href="./album/static/lib/fluid960gs-text.css" />
        <link rel="stylesheet" href="./album/static/lib/fluid960gs-grid.css" />
        <link rel="stylesheet" href="./album/static/album.css" />
      </head>
      <body>
        <div className="container_16">
          <div className="grid_8">
            <section id="galleryDropdown" dangerouslySetInnerHTML={{ __html: props.galleries }} />
            <div>
              Album
              <select id="editAlbums" tabIndex="2">
                <option value="">Edit these album photos</option>
              </select>
              <input type="button" id="changeAlbum" value="View" />
            </div>
            <div>
              Sort by
              <select id="sortGallery" tabIndex="3">
                <option value="">XML</option>
                <option>City</option>
                <option>Location</option>
                <option value="filename">Date</option>
              </select>
              <input type="button" id="changeSort" value="Sort" />
            </div>
            <div id="listPhotos" />
          </div>
          <div id="right" className="grid_8">
            <fieldset>
              <legend>Edit Photo Meta Data</legend>
              <p><b>Generate XML then copy to album XML document.</b></p>
              <p>
                <label htmlFor="filename">Filename</label>
                <input type="text" id="filename" disabled="disabled" />
                <span className="suggestions" />
              </p>
              <p>
                <label htmlFor="city">City</label>
                <input type="text" id="city" tabIndex="4" />
                <input type="checkbox" title="Check to disable editability" />
                <span className="suggestions" />
              </p>
              <p>
                <label htmlFor="location">Location</label>
                <input type="text" id="location" tabIndex="5" />
                <input type="checkbox" title="Check to disable editability" />
                <span className="suggestions" />
              </p>
              <p>
                <label htmlFor="caption">Caption</label>
                <input type="text" id="caption" tabIndex="6" />
                <input type="checkbox" title="Check to disable editability" />
                <span className="suggestions" />
              </p>
              <p>
                <label htmlFor="description">Description</label>
                <input type="text" id="description" tabIndex="7" />
                <input type="checkbox" title="Check to disable editability" />
                <span className="suggestions" />
              </p>
              <p>
                <label htmlFor="ref_src"><select id="ref_src" tabIndex="8">
                  <option />
                  <option value="facebook">Facebook</option>
                  <option value="google">Google</option>
                  <option value="wikipedia">Wikipedia</option>
                </select></label>
                <input type="text" id="ref_name" tabIndex="9" title="Keywords" />
                <input type="checkbox" title="Check to disable editability" />
                <span className="suggestions" />
              </p>
              <p>
                <label htmlFor="geo_lat">Geolocation</label>
                <input type="text" id="geo_lat" className="half" tabIndex="10" title="Latitude" />
                <input type="text" id="geo_lon" className="half" tabIndex="11" title="Longitude" />
                <input type="checkbox" title="Check to disable editability" />
                <span className="suggestions" />
              </p>
              <input type="submit" value="Save" id="saveToJson" tabIndex="12" />
            </fieldset>
            <textarea id="rawAlbumJson" /><textarea id="rawAlbumJsonToXml" />
            <div id="photoPreview" />
          </div>
        </div>
        <script src="./album/static/jquery.js" />
        <script src="./album/static/lib/json_to_xml.js" />
        <script src="./album/static/admin-edit-xml-tested.js" />
        <script src="./album/static/edit_admin_xml.js" />
        <script id="app-state" dangerouslySetInnerHTML={{ __html: props.state }} />
        <script src="./album/assets/client.js" />
      </body>
    </html>
  );
}

Page.propTypes = {
  galleries: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
  state: React.PropTypes.string.isRequired,
};

module.exports = Page;
