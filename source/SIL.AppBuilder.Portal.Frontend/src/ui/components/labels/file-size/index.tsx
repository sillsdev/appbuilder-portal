import * as React from 'react';
import { compose } from 'recompose';
import { withTranslations, i18nProps } from '@lib/i18n';
import { withCurrentUser, IProvidedProps as ICurrentUserProps } from '@data/containers/with-current-user';
import { attributesFor } from '@data';
import * as fileSizeFormatter from 'pretty-bytes';

interface IOwnProps {
  size: number;
  className: string;
}

type IProps =
  & IOwnProps
  & ICurrentUserProps;

class FileSize extends React.Component<IProps> {

  render() {

    const { size, currentUser, className } = this.props;
    const { locale } = attributesFor(currentUser);

    if (!size) {
      return <span className={className}>{'--'}</span>;
    }

    const fileSizeFormatted = fileSizeFormatter(size, { locale: locale || 'en' });

    return (
      <span className={className}>{fileSizeFormatted}</span>
    );
  }
}

export default compose(
  withCurrentUser()
)(FileSize);