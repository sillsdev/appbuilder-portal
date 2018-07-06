import * as React from 'react';
import { withTemplateHelpers, Mut } from 'react-action-decorators';

import AvatarEditor from 'react-avatar-editor'
import { Button } from 'semantic-ui-react';

export interface IProps {
}

export interface IState {
  image: string;
}


@withTemplateHelpers
export default class EditProfileDisplay extends React.Component<IProps, IState> {

  mut: Mut;
  state = { image: '' };

  handleNewImage = e => {
    this.setState({ image: e.target.files[0] })
  }  

  render() {
    const { mut } = this;
    const { image } = this.state;

    return (
      <div>
        {!image ? 
        <div className='default-profile-image'>
          <span>JL</span>
        </div> :
        <AvatarEditor
          image={image}
          border={0}
          color={[255, 255, 255, 0.6]} // RGBA
          scale={1}
          rotate={0}
        />}
        <Button
          as={input}
          onChange={this.handleNewImage}
        >UPLOAD NEW PICTURE</Button>
      </div>
    );

  }

}