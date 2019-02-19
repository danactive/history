const React = require('react');

function Placeholder({ file }) {
  return (
    <li>
      <div className="preview" data-filename={file.filename}>
        <img src="/walk/static/spinner.gif" alt="Generating preview" />
      </div>
      <div className="caption">
        {file.filename}
      </div>
    </li>
  );
}

module.exports = Placeholder;
