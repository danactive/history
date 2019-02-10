// *********** HISTORY CUSTOM not React Boilerplate

import dotProp from 'dot-prop';

export const normalizeError = (error) => {
  const errorSummary = dotProp.get(error, 'error.error_summary');

  if (errorSummary) {
    const action = (errorSummary.includes('path/not_found')) ? 'missing-thumbLink' : undefined;
    const path = dotProp.get(error, 'response.req._data.path');

    return {
      message: errorSummary,
      status: dotProp.get(error, 'status'),
      type: 'normalized error_summary',
      ui: {
        action,
        path,
        title: `Dropbox asset is missing (${path})`,
      },
    };
  }

  const errorResponse = dotProp.get(error, 'response');

  if (errorResponse) {
    const message = dotProp.get(error, 'error', '');
    const isAuth = message.includes('OAuth') || dotProp.get(errorResponse, 'req.header.Authorization') === 'Bearer undefined';
    const action = isAuth ? 'incorrect-auth' : undefined;
    const path = dotProp.get(error, 'response.req._data.path');

    return {
      message,
      status: dotProp.get(error, 'status'),
      type: 'normalized error_response',
      ui: {
        action,
        path,
        title: `Dropbox auth is incorrect (${path})`,
      },
    };
  }

  const isNormalError = error.message && error.stack;
  if (isNormalError) {
    return {
      stack: error.stack,
      message: error.message,
      type: 'normalized message and stack',
      ui: {
        action: undefined,
        title: error.message,
      },
    };
  }

  return error;
};
