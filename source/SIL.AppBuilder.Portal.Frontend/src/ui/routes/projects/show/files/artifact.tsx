import * as React from 'react';
import { compose } from 'recompose';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import VerticalAlignBottomIcon from '@material-ui/icons/VerticalAlignBottom';

import { ProductArtifactResource, attributesFor } from '@data';
import FileSize from '@ui/components/labels/file-size';
import { withTranslations, i18nProps } from '@lib/i18n';

interface IOwnProps {
  artifact: ProductArtifactResource;
}

type IProps =
  & IOwnProps
  & i18nProps;

class Artifact extends React.Component<IOwnProps> {

  render() {

    const { artifact } = this.props;
    const { artifactType, url, fileSize } = attributesFor(artifact);

    return (
      <div className='artifact-item flex'>
        <div className='w-70 flex align-items-center'>
          <InsertDriveFileIcon className='m-r-sm' />
          <span data-test-project-files-artifact-name>{artifactType}</span>
        </div>
        <div className='w-30 flex align-items-center justify-content-end'>
          <FileSize size={fileSize} className='m-r-md' />
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