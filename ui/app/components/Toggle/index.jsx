import React from 'react';

import Select from './Select';
import ToggleOption from '../ToggleOption';

const Toggle = ({
  messages,
  onToggle,
  value,
  values,
}) => {
  let content = <option>--</option>;

  // If we have items, render them
  if (values) {
    content = values.map(item => (
      <ToggleOption key={item} value={item} message={messages[item]} />
    ));
  }

  return (
    <Select value={value} onChange={onToggle}>
      {content}
    </Select>
  );
};

export default Toggle;
