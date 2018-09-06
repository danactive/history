import dotProp from 'dot-prop';

export const normalizeError = (error) => {
  const message = dotProp.get(error, 'error.error_summary');

  if (message) {
    const action = (message === 'path/not_found/.') ? 'hide-thumb' : undefined;

    return {
      message,
      status: dotProp.get(error, 'status'),
      type: 'normalized error_summary',
      ui: {
        action,
        title: `Dropbox asset is missing (${dotProp.get(error, 'response.req._data.path')})`,
      }
    };
  }

  if (error.message && error.stack) {
    return {
      stack: error.stack,
      message: error.message,
      type: 'normalized message and stack',
    };
  }

  return error;
};
