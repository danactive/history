import useSWRMutation from "swr/mutation"

import config from "../../models/config"
import Img from "../Img"
import type { ItemState } from "./AdminAlbumClient"

const fetcher = async (url: string, { arg }: { arg: string }) =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: arg }),
  }).then((res) => res.json())

export default function AdminAlbumPhoto({ item }: { item: ItemState }) {
  const { trigger, data, error, isMutating } = useSWRMutation(
    "/api/admin/classify",
    fetcher,
  )

  if (!item?.photoPath) return <div>No photo</div>

  return (
    <>
      <Img
        src={item.photoPath}
        alt={item.caption}
        width={config.resizeDimensions.photo.width}
        height={config.resizeDimensions.photo.height-100}
      />
      <button
        onClick={(e) => {
          e.preventDefault()
          trigger(item.photoPath)
        }}
      >
        Classify Image
      </button>
      {isMutating && <p>Classifying...</p>}
      {error && <p>Error loading classification</p>}
      {data && <p>Predictions: {JSON.stringify(data.predictions)}</p>}
    </>
  )
}
