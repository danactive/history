// *********** HISTORY CUSTOM not React Boilerplate

import dotProp from 'dot-prop';

export default error => {
  const errorSummary = dotProp.get(error, 'error.error_summary');

  if (errorSummary) {
    let action;
    let title = `Dropbox error (${errorSummary})`;
    let path = null;

    if (errorSummary.includes('path/not_found')) {
      action = 'missing-thumbLink';
      path = dotProp.get(error, 'response.req._data.path', null);
      title = `Dropbox asset is missing (${path})`;
    }

    if (errorSummary.includes('too_many_requests')) {
      action = 'delay-reconnecting';
      title = 'Dropbox too many requests';
    }

    const out = {
      message: errorSummary,
      status: dotProp.get(error, 'status'),
      type: 'normalized error_summary',
      ui: {
        action,
        path,
        title,
      },
    };

    return out;
  }

  const errorResponse = dotProp.get(error, 'response');

  if (errorResponse) {
    const message = dotProp.get(error, 'error', '');
    const isAuth =
      message.includes('OAuth') ||
      dotProp.get(errorResponse, 'req.header.Authorization') ===
        'Bearer undefined';
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
