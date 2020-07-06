import { Formik, Field, Form } from 'formik';
import React from 'react';
import { useDispatch } from 'react-redux';

import { useInjectSaga } from 'redux-injectors';

import saga from './saga';
import { resizeImage } from './actions';

const ResizePage = () => {
  const dispatch = useDispatch();
  useInjectSaga({ key: 'mediaGallery', saga });

  return (
    <div>
      <h1>Resize</h1>
      <p>
        This page is partially functional. Place your JPG images into the file
        system in a specific folder and this form will resize from the original
        to photo and thumbnail. (Note: /todo/originals, /todo/photos,
        /todo/thumbs must be manually created)
      </p>

      <Formik
        initialValues={{ filename: '/todo/originals/2019-08-31-99.jpg' }}
        onSubmit={values => dispatch(resizeImage(values.filename))}
      >
        <Form>
          <Field type="text" name="filename" />
          <button type="submit">Resize image</button>
        </Form>
      </Formik>
    </div>
  );
};

export default ResizePage;
