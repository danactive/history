import React, { useState } from 'react';

import Button from '../../components/Button';
import config from '../../../../config.json';
import request from '../../utils/request';

function Rename({
  filenames,
  path,
  prefix,
}) {
  const [output, setOutput] = useState('');
  const postBody = {
    filenames,
    prefix,
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

  function onClick() {
    /*
    curl -d '{"filenames":["a.jpg","b.jpg"], "prefix": "2020-06-13",
    "source_folder": "/todo/doit", "preview": "false", "raw": "true", "rename_associated": "true"}'
    -i http://127.0.0.1:8000/admin/rename  -H "Content-Type: application/json"
     */
    return request(`http://localhost:${config.apiPort}/admin/rename`, options)
      .then(setOutput);
  }

  return [
    <Button
      key="rename"
      handleRoute={onClick}
    >
      Rename
    </Button>,
    <textarea
      key="console"
      id="console"
      style={{ padding: '1em', fontFamily: '"Montserrat", "sans-serif"', fontSize: '1em' }}
      value={JSON.stringify(output.xml, null, '\t')}
    />,
  ];
}

export default Rename;
