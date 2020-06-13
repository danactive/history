/* global document, fetch, getQueryByName */
import React from 'react';

function getAllFilenames() {
  const previews = Array.from(document.querySelectorAll('.preview'));
  const filenames = previews.map((p) => p.getAttribute('data-filename'));

  return filenames;
}

const getDate = () => document.getElementById('date').value;

const output = (message) => {
  document.getElementById('console').value = JSON.stringify(message, null, '\t');
};

function onClick() {
  const filenames = getAllFilenames();
  const prefix = getDate();
  const sourceFolder = getQueryByName('path');

  /*
  curl -d '{"filenames":["2001-03-21-01.jpg","2012-fireplace.jpg","2014-02-08-14.jpg"], "prefix": "2017-10-10",
  "source_folder": "/galleries/gallery-demo/media/photos/lots", "preview": "false", "raw": "true", "rename_associated": "true"}'
  -i http://127.0.0.1:8000/admin/rename  -H "Content-Type: application/json"
   */
  const data = {
    filenames,
    prefix,
    source_folder: sourceFolder,
    preview: false,
    raw: true,
    rename_associated: true,
  };
  const options = {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(data),
  };

  // TODO replace with request and fetchWithTimeout
  return fetch('/admin/rename', options)
    .then((response) => response.json())
    .then(output)
    .catch(output);
}

function Rename() {
  return [
    <button
      key="rename"
      onClick={onClick}
      type="button"
    >
      Rename
    </button>,
    <textarea key="console" id="console" style={{ padding: '1em', fontFamily: '"Montserrat", "sans-serif"', fontSize: '1em' }} />,
  ];
}

export default Rename;
