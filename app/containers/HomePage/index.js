/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';

import injectReducer from 'utils/injectReducer';
import injectSaga from 'utils/injectSaga';
import { makeSelectRepos, makeSelectRepoLoading, makeSelectRepoError } from 'containers/App/selectors';
import H2 from 'components/H2';
import ReposList from 'components/ReposList';
import GenericList from 'components/GenericList';
import GalleryListItem from 'containers/GalleryListItem';
import AtPrefix from './AtPrefix';
import Form from './Form';
import Input from './Input';
import Section from './Section';
import messages from './messages';

import { loadRepos } from '../App/actions';
import { changeUsername, loadGalleries } from './actions';
import { makeSelectUsername, makeSelectGalleries, makeSelectGalleryLoading, makeSelectGalleryError } from './selectors';
import reducer from './reducer';
import saga from './saga';

export class HomePage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentWillMount() {
    this.props.onLoad();
  }
  /**
   * when initial state username is not null, submit the form to load repos
   */
  componentDidMount() {
    if (this.props.username && this.props.username.trim().length > 0) {
      this.props.onSubmitForm();
    }
  }

  render() {
    const { repoLoading, repoError, repos, galleries, galleryLoading, galleryError } = this.props;
    const reposListProps = {
      loading: repoLoading,
      error: repoError,
      repos,
    };
    const galleryListProps = {
      loading: galleryLoading,
      error: galleryError,
      items: galleries,
      component: GalleryListItem,
    };

    return (
      <article>
        <Helmet>
          <title>History - View Galleries</title>
          <meta name="description" content="A React.js Boilerplate application homepage" />
        </Helmet>
        <div>
          <H2>
            <FormattedMessage {...messages.galleriesHeader} />
          </H2>
          <GenericList {...galleryListProps} />
          <Section>
            <H2>
              <FormattedMessage {...messages.trymeHeader} />
            </H2>
            <Form onSubmit={this.props.onSubmitForm}>
              <label htmlFor="username">
                <FormattedMessage {...messages.trymeMessage} />
                <AtPrefix>
                  <FormattedMessage {...messages.trymeAtPrefix} />
                </AtPrefix>
                <Input
                  id="username"
                  type="text"
                  placeholder="mxstbr"
                  value={this.props.username}
                  onChange={this.props.onChangeUsername}
                />
              </label>
            </Form>
            <ReposList {...reposListProps} />
          </Section>
        </div>
      </article>
    );
  }
}

HomePage.propTypes = {
  onLoad: PropTypes.func.isRequired,
  repoLoading: PropTypes.bool,
  repoError: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.bool,
  ]),
  repos: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.bool,
  ]),
  onSubmitForm: PropTypes.func,
  username: PropTypes.string,
  onChangeUsername: PropTypes.func,
  galleries: PropTypes.arrayOf(PropTypes.shape).isRequired,
  galleryLoading: PropTypes.bool,
  galleryError: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.bool,
  ]),
};

export function mapDispatchToProps(dispatch) {
  return {
    onLoad: () => dispatch(loadGalleries()),
    onChangeUsername: (evt) => dispatch(changeUsername(evt.target.value)),
    onSubmitForm: (evt) => {
      if (evt !== undefined && evt.preventDefault) evt.preventDefault();
      dispatch(loadRepos());
    },
  };
}

const mapStateToProps = createStructuredSelector({
  repos: makeSelectRepos(),
  username: makeSelectUsername(),
  repoLoading: makeSelectRepoLoading(),
  repoError: makeSelectRepoError(),
  galleries: makeSelectGalleries(),
  galleryLoading: makeSelectGalleryLoading(),
  galleryError: makeSelectGalleryError(),
});

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'home', reducer });
const withSaga = injectSaga({ key: 'home', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(HomePage);
