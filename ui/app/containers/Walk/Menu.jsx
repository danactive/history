import moment from 'moment';
import React, { useState } from 'react';
import 'react-dates/initialize';
import { isInclusivelyBeforeDay, SingleDatePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import { useDispatch } from 'react-redux';

import Button from '../../components/Button';

import actions from './actions';
import config from '../../../../config.json';
import request from '../../utils/request';

function Menu({ showMenu, imageFilenames, path }) {
  const dispatch = useDispatch();
  const [output, setOutput] = useState('');
  const [isFocused, setFocus] = useState(false);
  const [date, setDate] = useState(moment().hour(1));

  function handleRename() {
    const postBody = {
      filenames: imageFilenames,
      prefix: date.toISOString().split('T')[0],
      source_folder: path,
      preview: false,
      raw: true,
      rename_associated: true,
    };
    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(postBody),
    };
    /*
    curl -d '{"filenames":["a.jpg","b.jpg"], "prefix": "2020-06-13",
    "source_folder": "/todo/doit", "preview": "false", "raw": "true", "rename_associated": "true"}'
    -i http://127.0.0.1:8000/admin/rename  -H "Content-Type: application/json"
     */
    return request(
      `http://localhost:${config.apiPort}/admin/rename`,
      options,
    ).then(setOutput);
  }

  function handleResize() {
    dispatch(actions.resizeImages(imageFilenames));
  }

  if (showMenu) {
    return (
      <section>
        <SingleDatePicker
          date={date}
          displayFormat="yyyy-MM-DD"
          showDefaultInputIcon
          focused={isFocused}
          onDateChange={inputDate => setDate(inputDate)}
          onFocusChange={({ focused }) => setFocus(focused)}
          isOutsideRange={day => !isInclusivelyBeforeDay(day, moment())}
          regular
        />
        <Button key="rename" handleRoute={handleRename}>
          Rename
        </Button>
        <Button key="resize" handleRoute={handleResize}>
          Resize
        </Button>
        <textarea
          key="console"
          id="console"
          style={{
            padding: '1em',
            fontFamily: '"Montserrat", "sans-serif"',
            fontSize: '1em',
          }}
          value={JSON.stringify(output.xml, null, '\t')}
        />
      </section>
    );
  }

  return null;
}

export default Menu;
