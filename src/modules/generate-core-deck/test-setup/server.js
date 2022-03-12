import fsPromises from 'fs/promises'
import path from 'path'
import urlMappings from './url-mappings.js'
import * as msw from 'msw'
import * as mswNode from 'msw/node'
import * as paths from './paths.js'

const mockedGet = msw.rest.get('*', async (req, res, ctx) => {
  const { url } = req
  const filePath = path.join(paths.testDataDirectoryPath, urlMappings[url])
  const contents = await fsPromises.readFile(filePath)
  return res(
    ctx.status(200),
    ctx.body(contents)
  )
})

export default mswNode.setupServer(mockedGet)
