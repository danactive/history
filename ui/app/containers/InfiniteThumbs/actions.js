import { LOAD_THUMBS_SUCCESS } from '../AlbumViewPage/constants';

export function thumbsLoaded({
  gallery,
  album,
  newMemories,
  page,
}) {
  return {
    type: LOAD_THUMBS_SUCCESS,
    gallery,
    album,
    newMemories,
    page,
    hasMore: false,
  };
}
