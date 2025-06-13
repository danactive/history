import { Textarea } from '@mui/joy'

export default function Fields({ jsonBlob }: { jsonBlob: string | undefined }) {
  return (
    <>
      <Textarea defaultValue={jsonBlob} maxRows={5} />
    </>
  )
}
