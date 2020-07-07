import { Formik, Field, Form } from 'formik';
import React, { memo, useState } from 'react';
import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';

import { hostCase } from '../../utils/host';
import { update as updateStorage } from '../../utils/localStorage';
import messages from './messages';

const ErrorMessage = styled.span`
  color: red;
`;

function isUrl(value) {
  const pattern = /((http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?)|((http|https):\/\/(localhost)+([:0-9]{2,5})?)/g;
  return new RegExp(pattern).test(value);
}

function isToken(value) {
  const pattern = /^[0-9a-z_]{10,}$/gi;
  return new RegExp(pattern).test(value);
}

function HostStorage({ host, storageUpdated }) {
  const [stored, setStored] = useState(false);
  const hostName = hostCase(host);

  function handleTokenValidation(value) {
    const isValid = isUrl(value) || isToken(value);

    if (isValid) {
      return null;
    }

    setStored(false);
    return 'Invalid token (min 10 char) or URL';
  }

  function handleSubmit({ token }) {
    updateStorage(host, token);
    setStored(true);
    if (storageUpdated) {
      storageUpdated(host, token, true);
    }
  }

  return (
    <Formik initialValues={{ token: '' }} onSubmit={handleSubmit}>
      {({ errors, touched, isValidating }) => (
        <Form data-testid="form">
          <FormattedMessage
            {...messages.instruction}
            values={{
              host: hostName,
            }}
          />
          <Field
            type="text"
            name="token"
            aria-label="Token input"
            validate={handleTokenValidation}
          />
          {errors.token && touched.token && (
            <ErrorMessage aria-label="Token error">{errors.token}</ErrorMessage>
          )}
          <input
            type="submit"
            aria-label="Submit button"
            disabled={isValidating}
            value="Store in browser"
          />
          {stored && (
            <span role="img" aria-label="success">
              ✅
            </span>
          )}
        </Form>
      )}
    </Formik>
  );
}

export default memo(HostStorage);
