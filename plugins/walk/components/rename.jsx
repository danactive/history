/* global document */
import React from 'react';

function getAllFilenames() {
  const previews = Array.from(document.querySelectorAll('.preview'));
  const filenames = previews.map(p => p.getAttribute('data-filename'));

  return filenames;
}

function getDate() {
  const date = document.getElementById('date').value;

  return date;
}

function onClick() {
  getAllFilenames();
  getDate();
}

function Rename() {
  return (
    <button
      key="rename"
      onClick={onClick}
    >
      Rename
    </button>
  );
}

module.exports = Rename;
