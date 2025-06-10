import { useRef } from "react"

import config from "../../models/config"
import Img from "../Img"
import type { ItemState } from "./AdminAlbumClient"

export default function AdminAlbumPhoto({ item }: { item: ItemState }) {
  const imgRef = useRef<HTMLImageElement>(null)
  if (!item?.photoPath) return <div>No photo</div>

  async function classifyImage() {
    const response = await fetch("/api/admin/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: item?.photoPath }),
    })

    const data = await response.json()
    console.log(data.predictions)
  }



  return (
    <>
      <Img
        ref={imgRef}
        src={item.photoPath}
        alt={item.caption}
        width={config.resizeDimensions.photo.width}
        height={config.resizeDimensions.photo.height-100}
      />
      <button
        onClick={(e) => {
          e.preventDefault()
          classifyImage()
        }}
      >Classify Image</button>
    </>
  )
}
