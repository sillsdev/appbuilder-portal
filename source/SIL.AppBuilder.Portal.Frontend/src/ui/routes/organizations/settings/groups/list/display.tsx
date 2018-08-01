import * as React from 'react';
import { InjectedTranslateProps as i18nProps } from 'react-i18next';

interface IOwnProps {
  groups: object[]
}

interface IState {
}

type IProps =
  & IOwnProps
  & i18nProps;

export default class ListDisplay extends React.Component<IProps, IState> {
  render() {
    const { t, groups } = this.props;

    const hasGroups = groups && groups.length > 0;

    return (
      <div>
        { !hasGroups && (
          <p className='gray-text p-b-lg'>{t('org.noGroups')}</p>
        ) }

        List of Groups
      </div>
    );
  }
}
