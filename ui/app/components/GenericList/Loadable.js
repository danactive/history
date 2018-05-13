/**
 *
 * Asynchronously loads the component for GalleryList
 *
 */

import Loadable from 'react-loadable';

export default Loadable({
  loader: () => import('./index'),
  loading: () => null,
});
