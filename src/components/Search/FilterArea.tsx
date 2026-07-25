import styles from './filter-area.module.css'

type Props = {
  searchControls: React.ReactNode
  contextualControls?: React.ReactNode
  emptyResults?: React.ReactNode
  memoryContent?: React.ReactNode
}

export default function FilterArea({
  searchControls,
  contextualControls,
  emptyResults,
  memoryContent,
}: Props) {
  return (
    <section className={styles.root}>
      <div className={styles.searchSection}>{searchControls}</div>
      {contextualControls ? (
        <div className={styles.contextualSection}>
          <div className={styles.contextualControls}>{contextualControls}</div>
        </div>
      ) : null}
      {emptyResults ? (
        <div className={styles.emptyResults}>{emptyResults}</div>
      ) : null}
      {memoryContent ? (
        <div className={styles.memoryContent}>{memoryContent}</div>
      ) : null}
    </section>
  )
}
