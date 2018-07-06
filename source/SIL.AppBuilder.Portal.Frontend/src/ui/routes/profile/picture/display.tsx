import * as React from 'react';
import { withTemplateHelpers, Mut } from 'react-action-decorators';

import AvatarEditor from 'react-avatar-editor'

export interface IProps {
}

export interface IState {
  file: File;
  url: string;
}


@withTemplateHelpers
export default class EditProfileDisplay extends React.Component<IProps, IState> {

  mut: Mut;
  editor: any;
  state = { 
    file: null,
    url: '',

  };

  handleNewImage = e => {
    this.setState({ 
      file: e.target.files[0],
      url: URL.createObjectURL(e.target.files[0]) 
    })
  }  

  setEditorRef = editor => {
    if (editor) this.editor = editor
  }  
  
  logCallback(e) {
    // eslint-disable-next-line
    console.log('callback', e)
  }

  render() {
    const { mut } = this;
    const { url } = this.state;

    return (
      <div>
        {!url ? 
          <div className='default-profile-image'>
            <span>JL</span>
          </div> :
          <img className='profile-image' src={url} />
        }
        <div>
          <label htmlFor="hidden-profile-picture" className="ui icon button">
            UPLOAD NEW PICTURE
          </label>
          <input 
            type="file" 
            id="hidden-profile-picture" 
            style={{display: 'none'}}
            onChange={this.handleNewImage}
          />
        </div>
      </div>
    );

  }

}