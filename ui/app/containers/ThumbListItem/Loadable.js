/**
 *
 * Asynchronously loads the component for ThumbListItem
 *
 */

import Loadable from 'react-loadable';

export default Loadable({
  loader: () => import('./index'),
  loading: () => null,
});
