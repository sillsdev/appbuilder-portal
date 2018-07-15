import * as React from 'react';

export interface IProps {
  onChange: (imageData: string) => void;
}

export interface IState {
  imageData: string;
}

class ImageProfile extends React.Component<IProps, IState> {

  state = {
    imageData: null
  };

  handleNewImage = e => {

    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();

      reader.readAsDataURL(e.target.files[0]);

      reader.onload = () => {
        this.setState({ imageData: reader.result },() => {
          this.props.onChange(reader.result);
        });
      };
    }


  }

  render() {

    const { imageData } = this.state;

    return (
      <div data-test-picture-profile>
        {!imageData ?
          <div className='default-profile-image'>
            <span>JL</span>
          </div> :
          <img
            className='profile-image'
            src={imageData}
            data-test-picture-uploaded
          />
        }
        <div>
          <label
            htmlFor="hidden-profile-picture"
            className="ui icon button upload-button"
            data-test-upload-picture
          >
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

export default ImageProfile;
