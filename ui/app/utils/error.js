import dotProp from 'dot-prop';

export const normalizeError = (error) => {
  const message = dotProp.get(error, 'error.error_summary');

  if (message) {
    const action = (message.includes('path/not_found')) ? 'add-placeholder-to-thumbLink' : undefined;
    const path = dotProp.get(error, 'response.req._data.path');

    return {
      message,
      status: dotProp.get(error, 'status'),
      type: 'normalized error_summary',
      ui: {
        action,
        path,
        title: `Dropbox asset is missing (${path})`,
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
