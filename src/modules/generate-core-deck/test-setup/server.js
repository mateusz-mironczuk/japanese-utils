import fsPromises from 'fs/promises'
import * as msw from 'msw'
import * as mswNode from 'msw/node'
import path from 'path'
import * as paths from './paths.js'
import urlMappings from './url-mappings.js'

const fileNameToSimulateNetworkError = 'まだ_まだ.mp3'

const mockedGet = function () {
  let interrupted = false
  return msw.rest.get('*', async (req, res, ctx) => {
    const fileName = urlMappings[req.url]

    if (!interrupted && fileName === fileNameToSimulateNetworkError) {
      interrupted = !interrupted
      return res.networkError('Failed to fetch a file')
    } else {
      const filePath = path.join(paths.testDataDirectoryPath, fileName)
      const contents = await fsPromises.readFile(filePath)
      return res(
        ctx.status(200),
        ctx.body(contents)
      )
    }
  })
}()

export default mswNode.setupServer(mockedGet)
