import type { Dispatch, SetStateAction } from 'react'
import styles from './filter-area.module.css'
import MapVisibilityControl from './MapVisibilityControl'

type Props = {
  searchControls: React.ReactNode
  isMapVisible: boolean
  setIsMapVisible: Dispatch<SetStateAction<boolean>>
  contextualControls?: React.ReactNode
  emptyResults?: React.ReactNode
  memoryContent?: React.ReactNode
}

export default function FilterArea({
  searchControls,
  isMapVisible,
  setIsMapVisible,
  contextualControls,
  emptyResults,
  memoryContent,
}: Props) {
  return (
    <section className={styles.root}>
      <div className={styles.topRow}>
        <div className={styles.searchSection}>{searchControls}</div>
      </div>
      {contextualControls ? (
        <div className={styles.contextualSection}>
          <div className={styles.contextualControls}>{contextualControls}</div>
        </div>
      ) : null}
      {emptyResults ? (
        <div className={styles.emptyResults}>{emptyResults}</div>
      ) : null}
      {memoryContent ? (
        <div className={styles.memoryContent}>
          <div className={styles.memoryDetails}>{memoryContent}</div>
          <div className={styles.viewerControl}>
            <MapVisibilityControl isMapVisible={isMapVisible} setIsMapVisible={setIsMapVisible} />
          </div>
        </div>
      ) : null}
    </section>
  )
}
