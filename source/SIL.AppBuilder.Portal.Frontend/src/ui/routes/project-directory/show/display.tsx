import * as React from 'react';
import { ProjectResource } from '@data';
import { i18nProps } from '@lib/i18n';

import { IExpectedPropsForRoute } from './types';
import Header from './header';
import Details from './details';

interface IExpectedProps {
  project: ProjectResource;
}

type IProps = IExpectedPropsForRoute & IExpectedProps & i18nProps;

export default class Display extends React.Component<IProps> {
  render() {
    const { project } = this.props;

    return (
      <div className='ui container'>
        <div className='project-details' data-test-public-project>
          <Header project={project} />

          <div className='flex-lg p-b-xxl-lg'>
            <Details project={project} />
          </div>
        </div>
      </div>
    );
  }
}
