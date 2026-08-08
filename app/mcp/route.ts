import { createStorytellingHttpHandler } from '../../mcp/storytelling'

const handler = createStorytellingHttpHandler()

function handle(request: Request) {
  return handler.fetch(request)
}

export {
  handle as DELETE,
  handle as GET,
  handle as POST,
}
