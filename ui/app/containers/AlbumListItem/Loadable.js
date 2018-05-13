/**
 *
 * Asynchronously loads the component for AlbumListItem
 *
 */

import Loadable from 'react-loadable';

export default Loadable({
  loader: () => import('./index'),
  loading: () => null,
});
