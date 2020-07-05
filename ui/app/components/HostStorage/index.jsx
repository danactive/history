import { Formik, Field, Form } from 'formik';
import React, { memo, useState } from 'react';
import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';

import { hostCase } from '../../utils/strings';
import messages from './messages';

const ErrorMessage = styled.span`
  color: red;
`;

function isUrl(value) {
  const pattern = /(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?/g;
  return new RegExp(pattern).test(value);
}

function isToken(value) {
  const pattern = /^[0-9a-z_]{10,}$/gi;
  return new RegExp(pattern).test(value);
}

function HostStorage({ host }) {
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
    localStorage.setItem(`host-${host}`, token);
    setStored(true);
  }

  return (
    <Formik initialValues={{ token: '' }} onSubmit={handleSubmit}>
      {({ errors, touched, isValidating }) => (
        <Form>
          <FormattedMessage
            {...messages.instruction}
            values={{
              host: hostName,
            }}
          />
          <Field type="text" name="token" validate={handleTokenValidation} />
          {errors.token && touched.token && (
            <ErrorMessage>{errors.token}</ErrorMessage>
          )}
          <button type="submit" disabled={isValidating}>
            Store in browser
          </button>
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
