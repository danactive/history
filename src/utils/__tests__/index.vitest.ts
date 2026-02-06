import { describe, expect, test } from 'vitest'

import config from '../../../src/models/config'
import { getExt } from '../index'

describe('Utilities', () => {
  describe('getExt', () => {
    test('Missing filename', () => {
      expect(getExt('')).toBe(null)
    })
    test('Multiple filenames', () => {
      expect(getExt(['2021-12-25.mp4', '2021-12-25.webm'])).toBe('mp4')
    })
    test('Case insensitive', () => {
      expect(getExt('2021-12-25.jpg')).toBe('jpg')
      expect(getExt('2021-12-25.JPG')).toBe('jpg')
      expect(getExt('2021-12-25.JpG')).toBe('jpg')
    })
    test('Photo file types', () => {
      config.supportedFileTypes.photo.forEach((ext) => expect(getExt(`2021-12-25.${ext}`)).toBe(ext))
      config.rawFileTypes.photo.forEach((ext) => expect(getExt(`2021-12-25.${ext}`)).toBe(ext))
    })
    test('Video file types', () => {
      config.supportedFileTypes.video.forEach((ext) => expect(getExt(`2021-12-25.${ext}`)).toBe((ext)))
      config.rawFileTypes.video.forEach((ext) => expect(getExt(`2021-12-25.${ext}`)).toBe(ext))
    })
    test('Multiple dots', () => {
      expect(getExt('2021-12-25.best.jpg')).toBe('jpg')
      expect(getExt('2021-12-25.thumb.JPG')).toBe('jpg')
      expect(getExt('2021-12-25..JpG')).toBe('jpg')
    })
  })
})
