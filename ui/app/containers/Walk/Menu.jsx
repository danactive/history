import moment from 'moment';
import React, { useState } from 'react';
import 'react-dates/initialize';
import { isInclusivelyBeforeDay, SingleDatePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';

import RenameButton from './RenameButton';

function Menu({
  showMenu,
  imageFilenames,
  path,
}) {
  const [isFocused, setFocus] = useState(false);
  const [date, setDate] = useState(moment().hour(1));

  if (showMenu) {
    return (
      <section>
        <SingleDatePicker
          date={date}
          displayFormat="yyyy-MM-DD"
          showDefaultInputIcon
          focused={isFocused}
          onDateChange={(inputDate) => setDate(inputDate)}
          onFocusChange={({ focused }) => setFocus(focused)}
          isOutsideRange={(day) => !isInclusivelyBeforeDay(day, moment())}
          regular
        />
        <RenameButton
          filenames={imageFilenames}
          prefix={date.toISOString().split('T')[0]}
          path={path}
        />
      </section>
    );
  }

  return null;
}

export default Menu;
