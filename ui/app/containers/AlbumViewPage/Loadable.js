/**
 *
 * Asynchronously loads the component for AlbumViewPage
 *
 */

import Loadable from 'react-loadable';

export default Loadable({
  loader: () => import('./index'),
  loading: () => null,
});
