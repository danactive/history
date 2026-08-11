import styles from './empty-results.module.css'

type Props = {
  message: React.ReactNode
  action?: React.ReactNode
}

export default function EmptyResults({ message, action }: Props) {
  return (
    <div className={styles.root}>
      <strong className={styles.message}>{message}</strong>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  )
}