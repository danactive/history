import React, { useEffect, useState } from 'react';

const defaults = {
  geocode: '13.7524000,100.5021833',
  instruction: 'Keyword or GeoCode',
  searchOrder: 'relevance',
};

const getQS = () =>
  typeof URL === 'undefined' ? '' : new URL(window.location.href).search;

// output sample '49.25,-123.1' or ''
function getGeoCode(qs) {
  const matches = /(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/.exec(qs);
  return matches ? matches[0] : '';
}

export default function SearchBar({ onSearchChange: changeSearch }) {
  const [searchOrder, setSearchOrder] = useState(defaults.searchOrder);
  const [searchValue, setSearchValue] = useState(
    getGeoCode(getQS()) || defaults.geocode,
  );

  useEffect(() => {
    changeSearch(searchValue, { searchOrder });
  }, []);

  const handleSearchChange = keyword => {
    setSearchValue(keyword);

    changeSearch(keyword, { searchOrder });
  };

  const onOrderChange = order => {
    setSearchOrder(order);

    changeSearch(searchValue, { searchOrder: order });
  };

  return (
    <section id="search-bar">
      <input
        onChange={event => handleSearchChange(event.target.value)}
        placeholder={defaults.instruction}
        title={defaults.instruction}
        value={searchValue}
        tabIndex="1"
      />
      <select
        defaultValue="relevance"
        onChange={event => onOrderChange(event.target.value)}
        tabIndex="2"
      >
        <option value="date">Date of creation</option>
        <option value="relevance">Relevance</option>
      </select>
    </section>
  );
}
