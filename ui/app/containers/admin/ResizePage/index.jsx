import { Formik } from 'formik';
import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import injectSaga from '../../../utils/injectSaga';

import saga from './saga';
import { resizeImage } from './actions';

const ResizePage = (props) => {
  const {
    triggerResizeImage, // dispatch
  } = props;

  return (
    <div>
      <h1>Resize</h1>
      <p>
        This page is partially functional. Place your JPG images into the file system in a
        specific folder and this form will resize from the original to photo and thumbnail.

        (Note: /todo/originals, /todo/photos, /todo/thumbs must be manually created)
      </p>

      <Formik
        initialValues={{ filename: '/todo/originals/2019-08-31-99.jpg' }}
        onSubmit={values => triggerResizeImage(values.filename)}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleSubmit,
          isSubmitting,
        }) => (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="filename"
              value={values.filename}
              onChange={handleChange}
            />
            {touched.filename && errors.filename}
            <button type="submit" disabled={isSubmitting}>
              Resize image
            </button>
          </form>
        )}
      </Formik>
    </div>
  );
};

function mapDispatchToProps(dispatch) {
  return {
    triggerResizeImage: filename => dispatch(resizeImage(filename)),
  };
}

const withConnect = connect(null, mapDispatchToProps);
const withSaga = injectSaga({ key: 'mediaGallery', saga });

export default compose(
  withSaga,
  withConnect,
)(ResizePage);
