/**
 *
 * Asynchronously loads the component for PhotoImg
 *
 */

import Loadable from 'react-loadable';

export default Loadable({
  loader: () => import('./index'),
  loading: () => null,
});
