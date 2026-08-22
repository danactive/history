import type { Filesystem } from '../lib/filesystems'
import type { PersonOption } from '../lib/domains/persons'
import type { ClusteredMarkers } from '../lib/generate-clusters'
import type { AgeSummaryValue } from '../utils/person-age'
import type { ActiveFacetCounts } from '../lib/active-facets'
import type {
  AlbumMeta,
  Gallery as GalleryName,
  IndexedKeywords,
  ServerSideAlbumItem,
  ServerSideAllItem,
  ServerSidePhotoItem,
  ServerSideTodayItem,
} from './common'

export type ServerPageDataBase<TItem> = {
  items: TItem[];
  indexedKeywords: IndexedKeywords[];
  personOptions?: PersonOption[];
  tagOptions?: IndexedKeywords[];
  totalItemCount?: number;
  activeFacetCounts?: ActiveFacetCounts;
}

export type SearchMetadata = Pick<ServerPageDataBase<never>, 'indexedKeywords' | 'personOptions' | 'tagOptions' | 'activeFacetCounts'>

export type SearchUiConfig = {
  summaryLabel?: string;
  totalCount?: number;
  personDetailsName?: string | null;
  extraFilterChips?: React.ReactNode;
  extraFiltersActive?: boolean;
  onClearExtraFilters?: () => void;
  extraQueryParamsToClear?: string[];
  onStructuredOptionSubmit?: (option: IndexedKeywords) => boolean;
  ownedPersonFilter?: boolean;
}

export type SearchControllerConfig = Pick<
  SearchUiConfig,
  'onClearExtraFilters' | 'extraQueryParamsToClear' | 'onStructuredOptionSubmit' | 'ownedPersonFilter'
>

export type AgeSummary = {
  ages: { age: AgeSummaryValue; count: number }[];
  totalPhotoCount?: number;
}

export type PersonFilterScopeData = {
  initialAgeSummary?: AgeSummary;
  initialBaseScopeItems?: ServerSideAllItem[];
  initialSelectedAge?: number | 'unknown' | null;
  initialSelectedPerson?: string | null;
}

export type AllItemsPageData = ServerPageDataBase<ServerSideAllItem> & {
  gallery: GalleryName;
} & PersonFilterScopeData

export type PhotoPageData<TItem> = ServerPageDataBase<TItem> & {
  album?: NonNullable<AlbumMeta['albumName']>;
  monthDay?: string;
  meta?: object;
}

export type PhotoPageComponentProps<TItem> = PhotoPageData<TItem> & {
  gallery: GalleryName;
  clusteredMarkers: ClusteredMarkers;
}

export namespace Gallery {
  export type ComponentProps = SearchMetadata & {
    gallery: GalleryName;
    albums: ServerSideAlbumItem[];
  }
}

export namespace Album {
  export type ComponentProps = PhotoPageComponentProps<ServerSidePhotoItem>

  export type ItemData = PhotoPageData<ServerSidePhotoItem> & {
    gallery: GalleryName;
  }
}

export namespace Today {
  export type ItemData = PhotoPageData<ServerSideTodayItem>

  export type ComponentProps = PhotoPageComponentProps<ServerSideTodayItem>
}

export namespace Persons {
  export type ItemData = AllItemsPageData

  export type ComponentProps = ItemData & {
    clusteredMarkers: ClusteredMarkers;
  }
}

export namespace Walk {
  export type ItemFile = Filesystem
}

export namespace All {
  export type ItemData = AllItemsPageData & {
    trailingAction?: React.ReactNode;
  }

  export type ComponentProps = ItemData & {
    clusteredMarkers: ClusteredMarkers;
  }
}
