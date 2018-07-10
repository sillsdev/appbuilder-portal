import * as React from 'react';

export interface IProps {
  onChange: (imageData: String) => void
}

export interface IState {
  imageData: String;
}

class ImageProfile extends React.Component<IProps, IState> {

  state = { 
    imageData: null
  };

  handleNewImage = e => {
 
    if (e.target.files && e.target.files[0]) {
      
      let reader = new FileReader();
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
      <div>
        {!imageData ? 
          <div className='default-profile-image'>
            <span>JL</span>
          </div> :
          <img className='profile-image' src={imageData} />
        }
        <div>
          <label htmlFor="hidden-profile-picture" className="ui icon button upload-button">
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