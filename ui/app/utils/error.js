import dotProp from 'dot-prop';

export const normalizeError = (error) => {
  if (error.error_summary) {
    return {
      message: dotProp.get(error, 'error.error_summary'),
      status: dotProp.get(error, 'status'),
      debug: dotProp.get(error, 'response.req._data.path'),
    };
  }

  if (error.message && error.stack) {
    return {
      debug: error.stack,
      message: error.message,
    };
  }

  return error;
};
