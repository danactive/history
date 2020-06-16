const React = require('react');

function Page() {
  return (
    <html lang="en">
      <head>
        <title>
          History
        </title>
        <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
      </head>
      <body>
        <ul>
          <li>
            <a href="/edit/album">
              Edit Album
            </a>
          </li>
        </ul>
      </body>
    </html>
  );
}

module.exports = Page;
