import raw from '../../config.json' assert { type: 'json' }
import type { Gallery } from '../types/common'
import type { Config } from '../types/config'

const config: Config = {
  ...raw,
  defaultGallery: raw.defaultGallery as Gallery,
}

export default config
