import * as React from 'react';
import { InjectedTranslateProps as i18nProps } from 'react-i18next';


import { Icon } from 'semantic-ui-react';
import { NotificationResource } from '@data';
import { withDataActions, IProvidedProps as IDataProps } from '@data/containers/resources/notification/with-data-actions';
import { compose } from 'recompose';
import { withTimeAgo } from '@lib/with-time-ago';

export interface IOwnProps {
  timeAgo: any;
  notification: NotificationResource;
}

export type IProps =
  & IOwnProps
  & IDataProps
  & i18nProps;

class Row extends React.Component<IProps> {
  state = { visible: false };

  toggle = () => {
    const { markAsSeen } = this.props;

    if (this.state.visible) {
      markAsSeen();
    }

    this.setState({ visible: !this.state.visible });
  }

  markAsSeen = (e) => {
    const { markAsSeen } = this.props;

    e.preventDefault();

    markAsSeen();
  }

  clear = (e) => {
    const { clear } = this.props;

    e.preventDefault();

    clear();
  }

  render() {
    const { timeAgo } = this.props;
    const { notification } = this.props;

    const { title, description, time, isViewed } = notification.attributes;
    const viewState = isViewed ? 'seen' : 'not-seen';

    if (!notification.attributes.show) {
      return null;
    }

    return (
      <div
        data-test-notification
        className={`notification-item ${viewState}`}
        onClick={this.markAsSeen}>

        <a
          data-test-notification-close-one
          className='close'
          href='#'
          onClick={this.clear}>

          <Icon name='close' />
        </a>

        <h4 className='title'>{title}</h4>
        <p className={!isViewed ? 'bold' : ''}>{description}</p>
        <p className='time'>{timeAgo && timeAgo.format(time)}</p>
      </div>
    );

  }
}

export default compose(
  withTimeAgo,
  withDataActions
)(Row);
