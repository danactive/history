export type ClassifierBackendFailure = {
  status: number
  code: 'classifier_unavailable' | 'classifier_outdated' | 'classifier_timeout' | 'classifier_error'
  message: string
}

const START_CLASSIFIER_MESSAGE = (
  'The photo classifier is not running. Start the Python AI service with make ai-api, then try again.'
)

const OUTDATED_CLASSIFIER_MESSAGE = (
  'The Python AI service is out of date. Stop it, run make build-ai-api, then start it with make ai-api.'
)

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
)

function nestedErrorCode(error: unknown): string | undefined {
  let current = error
  for (let depth = 0; depth < 4 && isRecord(current); depth++) {
    if (typeof current.code === 'string') return current.code
    if (current.cause === current) return undefined
    current = current.cause
  }
  return undefined
}

function backendErrorMessage(payload: unknown): string | undefined {
  if (!isRecord(payload)) return undefined
  if (typeof payload.error === 'string' && payload.error.trim()) return payload.error
  if (typeof payload.detail === 'string' && payload.detail.trim()) return payload.detail
  return undefined
}

export function parseBackendJson(body: string): unknown {
  if (!body) return null
  try {
    return JSON.parse(body)
  } catch {
    return null
  }
}

export function classifierFetchFailure(error: unknown): ClassifierBackendFailure {
  if (isRecord(error) && error.name === 'TimeoutError') {
    return {
      status: 504,
      code: 'classifier_timeout',
      message: 'Photo classification timed out while the AI service was loading. Try again.',
    }
  }

  const code = nestedErrorCode(error)
  if (!code || ['ECONNREFUSED', 'ECONNRESET', 'EHOSTUNREACH'].includes(code)) {
    return {
      status: 503,
      code: 'classifier_unavailable',
      message: START_CLASSIFIER_MESSAGE,
    }
  }

  return {
    status: 502,
    code: 'classifier_error',
    message: 'Next could not reach the Python AI service. Check the AI service and try again.',
  }
}

export function classifierHttpFailure(status: number, payload: unknown): ClassifierBackendFailure {
  if (status === 404) {
    return {
      status: 503,
      code: 'classifier_outdated',
      message: OUTDATED_CLASSIFIER_MESSAGE,
    }
  }

  const backendMessage = backendErrorMessage(payload)
  if (status === 503) {
    return {
      status,
      code: 'classifier_unavailable',
      message: backendMessage
        ? `The photo classifier is unavailable: ${backendMessage}`
        : START_CLASSIFIER_MESSAGE,
    }
  }

  return {
    status,
    code: 'classifier_error',
    message: backendMessage ?? `Photo classification failed with HTTP ${status}.`,
  }
}

export function classifierUnexpectedResponseFailure(): ClassifierBackendFailure {
  return {
    status: 502,
    code: 'classifier_outdated',
    message: OUTDATED_CLASSIFIER_MESSAGE,
  }
}
