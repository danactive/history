import { z } from 'zod/v4-mini'

function isStandardError(error: unknown): error is Error {
  if (error instanceof Error) return true
  if ('message' in (error as any) && 'stack' in (error as any)) {
    return true
  }
  return false
}

function isZodError(error: unknown): error is z.core.$ZodError {
  if (error instanceof z.core.$ZodError) return true
  return false
}

function simplifyZodMessages(error: z.core.$ZodError) {
  return error?.issues.reduce((prev: string, curr: z.core.$ZodIssue) => {
    if (prev === '') prev += curr.message
    else prev += `; ${curr.message}`
    return prev
  }, '')
}

function handleLibraryError(err: unknown, message: string, returnEnvelope: boolean, errorSchema: any) {
  if (returnEnvelope) {
    if (isStandardError(err)) {
      return { body: errorSchema(err.message), status: 500 }
    }
    return { body: errorSchema(message), status: 404 }
  }

  console.error('ERROR', message, err)
  throw err
}

function isValidStringArray<T extends string = string>(arr: unknown): arr is T[] {
  return (
    Array.isArray(arr) &&
    arr.length > 0 &&
    arr.every((item): item is T => typeof item === 'string' && item.trim().length > 0)
  )
}

export { handleLibraryError, isStandardError, isValidStringArray, isZodError, simplifyZodMessages }
