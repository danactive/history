import styles from './persons-fallback.module.css'

export default function PersonsFallback() {
  return (
    <div className={styles.root}>
      <section className={styles.controls} aria-hidden="true">
        <div className={styles.summaryBar} />
        <div className={styles.subheadingBar} />
        <div className={styles.chips}>
          <div className={`${styles.chip} ${styles.chipWide}`} />
          <div className={`${styles.chip} ${styles.chipMedium}`} />
          <div className={`${styles.chip} ${styles.chipMedium}`} />
        </div>
      </section>
      <section className={styles.viewer} aria-hidden="true">
        <div className={styles.galleryPane} />
        <div className={styles.mapPane} />
      </section>
    </div>
  )
}
