const propTypes = require('prop-types');
const React = require('react');

function textField({ label, tabIndex }) {
  const name = label.toLowerCase();
  return (
    <p>
      <label htmlFor={name}>
        {label}
        <input type="text" id={name} tabIndex={tabIndex} />
      </label>
      <input type="checkbox" title="Check to disable editability" />
      <span className="suggestions" />
    </p>
  );
}

function Page(props) {
  const {
    galleries,
    state,
  } = props;
  return (
    <html lang="en">
      <head>
        <title>
          History
        </title>
        <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
        <link rel="stylesheet" href="./album/static/lib/fluid960gs-reset.css" />
        <link rel="stylesheet" href="./album/static/lib/fluid960gs-text.css" />
        <link rel="stylesheet" href="./album/static/lib/fluid960gs-grid.css" />
        <link rel="stylesheet" href="./album/static/album.css" />
      </head>
      <body>
        <div className="container_16">
          <div className="grid_8">
            <section id="galleryDropdown" dangerouslySetInnerHTML={{ __html: galleries }} />
            <div>
              Album
              <select id="editAlbums" tabIndex="2">
                <option value="">
                  Edit these album photos
                </option>
              </select>
              <input type="button" id="changeAlbum" value="View" />
            </div>
            <div>
              Sort by
              <select id="sortGallery" tabIndex="3">
                <option value="">
                  XML
                </option>
                <option>
                  City
                </option>
                <option>
                  Location
                </option>
                <option value="filename">
                  Date
                </option>
              </select>
              <input type="button" id="changeSort" value="Sort" />
            </div>
            <div id="listPhotos" />
          </div>
          <div id="right" className="grid_8">
            <form>
              <fieldset>
                <legend>
                  Edit Photo Meta Data
                </legend>
                <p>
                  <b>
                    Generate XML then copy to album XML document.
                  </b>
                </p>
                <p>
                  <label htmlFor="filename">
                    Filename
                    <input type="text" id="filename" disabled="disabled" />
                  </label>
                  <span className="suggestions" />
                </p>
                {textField({ label: 'City', tabIndex: 4 })}
                {textField({ label: 'Location', tabIndex: 5 })}
                {textField({ label: 'Caption', tabIndex: 6 })}
                {textField({ label: 'Description', tabIndex: 7 })}
                <p>
                  <select id="ref_src" tabIndex="8">
                    <option />
                    <option value="facebook">Facebook</option>
                    <option value="google">Google</option>
                    <option value="wikipedia">Wikipedia</option>
                    <option value="youtube">YouTube</option>
                  </select>
                  <input type="text" id="ref_name" tabIndex="9" title="Keywords" />
                  <input type="checkbox" title="Check to disable editability" />
                  <span className="suggestions" />
                </p>
                <p>
                  <label htmlFor="geo_lat">
                    Geolocation
                    <input type="text" id="geo_lat" className="half" tabIndex="10" title="Latitude" />
                  </label>
                  <input type="text" id="geo_lon" className="half" tabIndex="11" title="Longitude" />
                  <input type="checkbox" title="Check to disable editability" />
                  <span className="suggestions" />
                </p>
                <input type="submit" value="Save" id="saveToJson" tabIndex="12" />
              </fieldset>
            </form>
            <textarea id="rawAlbumJson" />
            <textarea id="rawAlbumJsonToXml" />
            <div id="photoPreview" />
          </div>
        </div>
        <script src="./album/static/jquery.js" />
        <script src="./album/static/lib/json_to_xml.js" />
        <script src="./album/static/admin-edit-xml-tested.js" />
        <script src="./album/static/edit_admin_xml.js" />
        <script id="app-state" dangerouslySetInnerHTML={{ __html: state }} />
        <script src="./album/static/assets/bundle.js" />
      </body>
    </html>
  );
}

textField.propTypes = {
  label: propTypes.string.isRequired,
  tabIndex: propTypes.number.isRequired,
};

Page.propTypes = {
  galleries: propTypes.arrayOf(propTypes.string).isRequired,
  state: propTypes.string.isRequired,
};

module.exports = Page;
