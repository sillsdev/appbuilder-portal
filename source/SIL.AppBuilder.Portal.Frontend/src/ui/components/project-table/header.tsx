import * as React from 'react';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';

interface IOwnProps {}

type IProps =
  & IOwnProps
  & i18nProps;

@translate('translations')
export default class extends React.Component<IProps> {
  render() {
    const { t } = this.props;

    return (
      <thead>
        <tr className='bold'>
          <td>Project</td>
          <td>Organization</td>
          <td>Language</td>
          <td>Status</td>
          <td>Last Updated</td>
          <td />
        </tr>
      </thead>
    );
  }
}
