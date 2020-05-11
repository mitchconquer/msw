import { match } from 'node-match-path'
import {
  RequestHandler,
  MockedRequest,
  defaultContext,
} from '../handlers/requestHandler'
import { MockedResponse, response } from '../response'
import { resolveRelativeUrl } from './resolveRelativeUrl'

interface ResponsePayload {
  response: MockedResponse | null
  handler: RequestHandler<any, any> | null
}

/**
 * Returns mocked response for a given request using following request handlers.
 */
export const getResponse = async <
  R extends MockedRequest,
  H extends Array<RequestHandler<any, any>>
>(
  req: R,
  handlers: H,
): Promise<ResponsePayload> => {
  const parsedUrl = new URL(req.url)
  req.query = parsedUrl.searchParams

  const relevantHandler = handlers.find((requestHandler) => {
    return requestHandler.predicate(req, parsedUrl)
  })

  if (relevantHandler == null) {
    return {
      response: null,
      handler: null,
    }
  }

  const { mask, defineContext, resolver } = relevantHandler

  // Retrieve request URL parameters based on the provided mask
  const params = (mask && match(resolveRelativeUrl(mask), req.url).params) || {}

  const requestWithParams: MockedRequest = {
    ...req,
    params,
  }

  const context = defineContext
    ? defineContext(requestWithParams)
    : defaultContext

  const mockedResponse: MockedResponse | undefined = await resolver(
    requestWithParams,
    response,
    context,
  )

  if (!mockedResponse) {
    return {
      response: null,
      handler: relevantHandler,
    }
  }

  const responseWithHeaders: MockedResponse = {
    ...mockedResponse,
    // @ts-ignore
    headers: Array.from(mockedResponse.headers.entries()),
  }

  return {
    response: responseWithHeaders,
    handler: relevantHandler,
  }
}
