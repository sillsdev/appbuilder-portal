import * as React from 'react';
import { compose } from 'recompose';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import VerticalAlignBottomIcon from '@material-ui/icons/VerticalAlignBottom';

import { ProductArtifactResource, attributesFor } from '@data';
import FileSize from '@ui/components/labels/file-size';
import TimezoneLabel from '@ui/components/labels/timezone';

interface IOwnProps {
  artifact: ProductArtifactResource;
}

type IProps =
  & IOwnProps;

class Artifact extends React.PureComponent<IProps> {
  render() {
    const { artifact } = this.props;
    const { artifactType, url, fileSize, dateUpdated } = attributesFor(artifact);

    return (
      <div data-test-artifact className='artifact-item flex p-l-md p-t-sm p-b-sm p-r-md'>
        <div className='flex-70 flex align-items-center'>
          <InsertDriveFileIcon className='m-r-sm' />
          <span data-test-project-files-artifact-name>{artifactType}</span>
        </div>
        <div className='flex-30 flex align-items-center justify-content-end'>
          <div className='flex-grow'>
            <TimezoneLabel dateTime={dateUpdated} className='m-r-md'/>
          </div>

          <FileSize size={fileSize} className='flex-30 text-align-right p-r-md' />
          <a href={url} download className='download flex-10'>
            <VerticalAlignBottomIcon />
          </a>
        </div>
      </div>
    );

  }

}

export default Artifact;