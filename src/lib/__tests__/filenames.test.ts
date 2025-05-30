import { futureFilenamesOutputs, uniqueFiles, videoTypeInList } from '../filenames'

describe('Filenames', () => {
  /*
   *     #     #                                  #######
   *     #     # #    # #  ####  #    # ######    #       # #      ######  ####
   *     #     # ##   # # #    # #    # #         #       # #      #      #
   *     #     # # #  # # #    # #    # #####     #####   # #      #####   ####
   *     #     # #  # # # #  # # #    # #         #       # #      #           #
   *     #     # #   ## # #   #  #    # #         #       # #      #      #    #
   *      #####  #    # #  ### #  ####  ######    #       # ###### ######  ####
   *
   */
  describe('Unique', () => {
    test('One photo per day', () => {
      const sourceFilenames = ['media1.jpg']
      const result = uniqueFiles(sourceFilenames)
      const results = result.values()

      expect(result.size).toBe(1)
      expect(results.next().value).toBe('media1')
    })

    test('Two photos per day', () => {
      const sourceFilenames = ['media1.jpg', 'media1.avi', 'media2.jpg']
      const result = uniqueFiles(sourceFilenames)
      const results = result.values()

      expect(result.size).toBe(2)
      expect(results.next().value).toBe('media1')
      expect(results.next().value).toBe('media2')
    })

    test('Three photos per day', () => {
      const sourceFilenames = ['media1.jpg', 'media2.avi', 'media3.mts']
      const result = uniqueFiles(sourceFilenames)
      const results = result.values()

      expect(result.size).toBe(3)
      expect(results.next().value).toBe('media1')
      expect(results.next().value).toBe('media2')
      expect(results.next().value).toBe('media3')
    })
  })

  /*
   *     #     #                           #######
   *     #     # # #####  ######  ####        #    #   # #####  ######
   *     #     # # #    # #      #    #       #     # #  #    # #
   *     #     # # #    # #####  #    #       #      #   #    # #####
   *      #   #  # #    # #      #    #       #      #   #####  #
   *       # #   # #    # #      #    #       #      #   #      #
   *        #    # #####  ######  ####        #      #   #      ######
   *
   */
  describe('Video Type', () => {
    test('Blank photo', () => {
      const sourceFilenames = ['']
      const result = videoTypeInList(sourceFilenames, 'media1')

      expect(result).toBe(false)
    })

    test('One photo', () => {
      const sourceFilenames = ['media1.jpg']
      const result = videoTypeInList(sourceFilenames, 'media1')

      expect(result).toBe(false)
    })

    test('Two photos', () => {
      const sourceFilenames = ['media1.jpg', 'media2.jpg', 'media2.avi']
      const result = videoTypeInList(sourceFilenames, 'media2')

      expect(result).toBe(true)
    })
  })

  /*
   *     #######                                      #######
   *     #       #    # ##### #    # #####  ######    #       # #      ###### #    #   ##   #    # ######  ####
   *     #       #    #   #   #    # #    # #         #       # #      #      ##   #  #  #  ##  ## #      #
   *     #####   #    #   #   #    # #    # #####     #####   # #      #####  # #  # #    # # ## # #####   ####
   *     #       #    #   #   #    # #####  #         #       # #      #      #  # # ###### #    # #           #
   *     #       #    #   #   #    # #   #  #         #       # #      #      #   ## #    # #    # #      #    #
   *     #        ####    #    ####  #    # ######    #       # ###### ###### #    # #    # #    # ######  ####
   *
   */
  describe('Future', () => {
    test('One photo per day', () => {
      const sourceFilenames = ['media1.jpg']
      const prefix = '2016-12-01'
      const result = futureFilenamesOutputs(sourceFilenames, prefix)

      expect(result.filenames[0]).toBe(`${prefix}-50.jpg`)
      expect(result.files[0]).toBe(`${prefix}-50`)
      expect(result.xml).toBe(`<item id="100"><filename>${prefix}-50.jpg</filename></item>`)
    })

    test('Two photos per day', () => {
      const sourceFilenames = ['media1.jpg', 'media2.jpg']
      const prefix = '2016-12-02'
      const result = futureFilenamesOutputs(sourceFilenames, prefix)

      expect(result.filenames[0]).toBe(`${prefix}-50.jpg`)
      expect(result.filenames[1]).toBe(`${prefix}-90.jpg`)
      expect(result.files[0]).toBe(`${prefix}-50`)
      expect(result.files[1]).toBe(`${prefix}-90`)
      expect(result.xml).toBe(
        `<item id="100"><filename>${prefix}-50.jpg</filename></item>`
        + `<item id="101"><filename>${prefix}-90.jpg</filename></item>`,
      )
    })

    test('Three photos per day', () => {
      const sourceFilenames = ['media1.jpg', 'media2.jpg', 'media3.jpeg']
      const prefix = '2016-12-03'
      const result = futureFilenamesOutputs(sourceFilenames, prefix)

      expect(result.filenames[0]).toBe(`${prefix}-37.jpg`)
      expect(result.filenames[1]).toBe(`${prefix}-64.jpg`)
      expect(result.filenames[2]).toBe(`${prefix}-90.jpg`)
      expect(result.files[0]).toBe(`${prefix}-37`)
      expect(result.files[1]).toBe(`${prefix}-64`)
      expect(result.files[2]).toBe(`${prefix}-90`)
      expect(result.xml).toBe(
        `<item id="100"><filename>${prefix}-37.jpg</filename></item>`
        + `<item id="101"><filename>${prefix}-64.jpg</filename></item>`
        + `<item id="102"><filename>${prefix}-90.jpg</filename></item>`,
      )
    })

    test('Four photos per day', () => {
      const sourceFilenames = ['media1.jpg', 'media2.jpg', 'media3.jpeg', 'media3.m2ts', 'media4.jpeg']
      const prefix = '2016-12-04'
      const result = futureFilenamesOutputs(sourceFilenames, prefix)

      expect(result.filenames[0]).toBe(`${prefix}-30.jpg`)
      expect(result.filenames[1]).toBe(`${prefix}-50.jpg`)
      expect(result.filenames[2]).toBe(`${prefix}-70.jpg`)
      expect(result.filenames[3]).toBe(`${prefix}-90.jpg`)
      expect(result.files[0]).toBe(`${prefix}-30`)
      expect(result.files[1]).toBe(`${prefix}-50`)
      expect(result.files[2]).toBe(`${prefix}-70`)
      expect(result.files[3]).toBe(`${prefix}-90`)
      expect(result.xml).toBe(
        `<item id="100"><filename>${prefix}-30.jpg</filename></item>`
        + `<item id="101"><filename>${prefix}-50.jpg</filename></item>`
        + `<item id="102"><type>video</type><filename>${prefix}-70.mp4</filename><filename>${prefix}-70.webm</filename></item>`
        + `<item id="103"><filename>${prefix}-90.jpg</filename></item>`,
      )
    })

    test('Five photos per day', () => {
      const sourceFilenames = ['media1.jpg', 'media2.jpg', 'media3.jpeg', 'media3.m2ts', 'media4.jpeg', 'media5.jpg']
      const prefix = '2016-12-05'
      const result = futureFilenamesOutputs(sourceFilenames, prefix)

      expect(result.filenames[0]).toBe(`${prefix}-26.jpg`)
      expect(result.filenames[1]).toBe(`${prefix}-42.jpg`)
      expect(result.filenames[2]).toBe(`${prefix}-58.jpg`)
      expect(result.filenames[3]).toBe(`${prefix}-74.jpg`)
      expect(result.filenames[4]).toBe(`${prefix}-90.jpg`)
      expect(result.files[0]).toBe(`${prefix}-26`)
      expect(result.files[1]).toBe(`${prefix}-42`)
      expect(result.files[2]).toBe(`${prefix}-58`)
      expect(result.files[3]).toBe(`${prefix}-74`)
      expect(result.files[4]).toBe(`${prefix}-90`)
    })

    test('34 photos per day', () => {
      const sourceFilenames = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg',
        '11.jpg', '12.jpg', '13.jpg', '14.jpg', '15.jpg', '16.jpg', '17.jpg', '18.jpg', '19.jpg', '20.jpg',
        '21.jpg', '22.jpg', '23.jpg', '24.jpg', '25.jpg', '26.jpg', '27.jpg', '28.jpg', '29.jpg', '30.jpg',
        '31.jpg', '32.jpg', '33.jpg', '34.jpg']
      const prefix = '2017-01-03'
      const result = futureFilenamesOutputs(sourceFilenames, prefix)

      expect(result.files[0]).toBe(`${prefix}-12`)
      expect(result.files[1]).toBe(`${prefix}-14`)
      expect(result.files[2]).toBe(`${prefix}-17`)
      expect(result.files[3]).toBe(`${prefix}-19`)
      expect(result.files[4]).toBe(`${prefix}-21`)
      expect(result.files[5]).toBe(`${prefix}-24`)
      expect(result.files[6]).toBe(`${prefix}-26`)
      expect(result.files[7]).toBe(`${prefix}-29`)
      expect(result.files[8]).toBe(`${prefix}-31`)
      expect(result.files[9]).toBe(`${prefix}-33`)
      expect(result.files[10]).toBe(`${prefix}-36`)
      expect(result.files[11]).toBe(`${prefix}-38`)
      expect(result.files[12]).toBe(`${prefix}-40`)
      expect(result.files[13]).toBe(`${prefix}-43`)
      expect(result.files[14]).toBe(`${prefix}-45`)
      expect(result.files[15]).toBe(`${prefix}-48`)
      expect(result.files[16]).toBe(`${prefix}-50`)
      expect(result.files[17]).toBe(`${prefix}-52`)
      expect(result.files[18]).toBe(`${prefix}-55`)
      expect(result.files[19]).toBe(`${prefix}-57`)
      expect(result.files[20]).toBe(`${prefix}-60`)

      expect(result.files[33]).toBe(`${prefix}-90`)
    })

    test('62 photos per day', () => {
      const sourceFilenames = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg',
        '11.jpg', '12.jpg', '13.jpg', '14.jpg', '15.jpg', '16.jpg', '17.jpg', '18.jpg', '19.jpg', '20.jpg',
        '21.jpg', '22.jpg', '23.jpg', '24.jpg', '25.jpg', '26.jpg', '27.jpg', '28.jpg', '29.jpg', '30.jpg',
        '31.jpg', '32.jpg', '33.jpg', '34.jpg', '35.jpg', '36.jpg', '37.jpg', '38.jpg', '39.jpg', '40.jpg',
        '41.jpg', '42.jpg', '43.jpg', '44.jpg', '45.jpg', '46.jpg', '47.jpg', '48.jpg', '49.jpg', '50.jpg',
        '51.jpg', '52.jpg', '53.jpg', '54.jpg', '55.jpg', '56.jpg', '57.jpg', '58.jpg', '59.jpg', '60.jpg',
        '61.jpg', '62.jpg']
      const prefix = '2017-03-01'
      const result = futureFilenamesOutputs(sourceFilenames, prefix)

      expect(result.files[0]).toBe(`${prefix}-11`)
      expect(result.files[1]).toBe(`${prefix}-12`)
      expect(result.files[2]).toBe(`${prefix}-13`)
      expect(result.files[3]).toBe(`${prefix}-15`)
      expect(result.files[4]).toBe(`${prefix}-16`)
      expect(result.files[5]).toBe(`${prefix}-17`)
      expect(result.files[6]).toBe(`${prefix}-19`)
      expect(result.files[7]).toBe(`${prefix}-20`)
      expect(result.files[8]).toBe(`${prefix}-21`)
      expect(result.files[9]).toBe(`${prefix}-23`)
      expect(result.files[10]).toBe(`${prefix}-24`)
      expect(result.files[11]).toBe(`${prefix}-25`)
      expect(result.files[12]).toBe(`${prefix}-26`)
      expect(result.files[13]).toBe(`${prefix}-28`)
      expect(result.files[14]).toBe(`${prefix}-29`)
      expect(result.files[15]).toBe(`${prefix}-30`)
      expect(result.files[16]).toBe(`${prefix}-32`)
      expect(result.files[17]).toBe(`${prefix}-33`)
      expect(result.files[18]).toBe(`${prefix}-34`)
      expect(result.files[19]).toBe(`${prefix}-36`)
      expect(result.files[20]).toBe(`${prefix}-37`)

      expect(result.files[60]).toBe(`${prefix}-89`)
      expect(result.files[61]).toBe(`${prefix}-90`)
    })

    test('One photo per day with a XML starting point', () => {
      const sourceFilenames = ['media1.arw', 'media1.mov', 'media1.jpg']
      const prefix = '2016-01-31'
      const result = futureFilenamesOutputs(sourceFilenames, prefix, 10)

      expect(result.filenames[0]).toBe(`${prefix}-50.jpg`)
      expect(result.files[0]).toBe(`${prefix}-50`)
      expect(result.xml).toBe(
        `<item id="10"><type>video</type><filename>${prefix}-50.mp4</filename><filename>${prefix}-50.webm</filename></item>`,
      )
    })

    test('Two photos per day with a XML starting point', () => {
      const sourceFilenames = ['media1.arw', 'media1.mts', 'media1.jpg', 'media2.raw', 'media2.avi', 'media2.jpg']
      const prefix = '2016-02-31'
      const result = futureFilenamesOutputs(sourceFilenames, prefix, 20)

      expect(result.filenames[0]).toBe(`${prefix}-50.jpg`)
      expect(result.filenames[1]).toBe(`${prefix}-90.jpg`)
      expect(result.files[0]).toBe(`${prefix}-50`)
      expect(result.files[1]).toBe(`${prefix}-90`)
      expect(result.xml).toBe(
        `<item id="20"><type>video</type><filename>${prefix}-50.mp4</filename><filename>${prefix}-50.webm</filename></item>`
        + `<item id="21"><type>video</type><filename>${prefix}-90.mp4</filename><filename>${prefix}-90.webm</filename></item>`,
      )
    })

    test('Three photos per day with a XML starting point', () => {
      const sourceFilenames = ['media1.arw', 'media1.mov', 'media1.jpg', 'media2.raw', 'media2.avi', 'media2.jpg', 'media3.jpg']
      const prefix = '2016-03-31'
      const result = futureFilenamesOutputs(sourceFilenames, prefix, 30)

      expect(result.filenames[0]).toBe(`${prefix}-37.jpg`)
      expect(result.filenames[1]).toBe(`${prefix}-64.jpg`)
      expect(result.filenames[2]).toBe(`${prefix}-90.jpg`)
      expect(result.files[0]).toBe(`${prefix}-37`)
      expect(result.files[1]).toBe(`${prefix}-64`)
      expect(result.files[2]).toBe(`${prefix}-90`)
      expect(result.xml).toBe(
        `<item id="30"><type>video</type><filename>${prefix}-37.mp4</filename><filename>${prefix}-37.webm</filename></item>`
        + `<item id="31"><type>video</type><filename>${prefix}-64.mp4</filename><filename>${prefix}-64.webm</filename></item>`
        + `<item id="32"><filename>${prefix}-90.jpg</filename></item>`,
      )
    })
  })
})
