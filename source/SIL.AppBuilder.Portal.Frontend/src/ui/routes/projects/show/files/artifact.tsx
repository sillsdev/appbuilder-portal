import * as React from 'react';
import { compose } from 'recompose';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import VerticalAlignBottomIcon from '@material-ui/icons/VerticalAlignBottom';

import { ProductArtifactResource, attributesFor } from '@data';
import FileSize from '@ui/components/labels/file-size';
import TimezoneLabel from '@ui/components/timezone-label';
import { withTranslations, i18nProps } from '@lib/i18n';

interface IOwnProps {
  artifact: ProductArtifactResource;
  includeHeader: boolean;
}

type IProps =
  & IOwnProps
  & i18nProps;

class Artifact extends React.Component<IProps> {

  render() {

    const { artifact, includeHeader, t } = this.props;
    const { artifactType, url, fileSize, dateUpdated } = attributesFor(artifact);

    return (
      <div className='artifact-item flex p-l-md p-t-sm p-b-sm p-r-md'>
        <div className='flex-70 flex align-items-center'>
          <InsertDriveFileIcon className='m-r-sm' />
          <span data-test-project-files-artifact-name>{artifactType}</span>
        </div>
        <div className='flex-30 flex align-items-center justify-content-end'>
          <div className='position-relative w-40'>
            {
              includeHeader ?
                <div className='column-header bold fs-13'>
                  {t('project.products.updated')}
                </div> : null
            }
            <TimezoneLabel dateTime={dateUpdated} className='m-r-md'/>
          </div>
          <FileSize size={fileSize} className='m-r-md w-30 text-align-right' />
          <a href={url} download className='download'>
            <VerticalAlignBottomIcon />
          </a>
        </div>
      </div>
    );

  }

}

export default compose(
  withTranslations
)(Artifact);