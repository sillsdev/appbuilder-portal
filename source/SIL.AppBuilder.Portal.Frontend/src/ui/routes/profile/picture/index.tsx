import * as React from 'react';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';

export interface IProps {
  onChange: (imageData: string) => void;
}

export interface IState {
  imageData: string;
  width: number;
  height: number;
}

class ImageProfile extends React.Component<IProps & i18nProps, IState> {

  state = {
    imageData: null,
    width: null,
    height: null
  };

  handleNewImage = e => {

    if (e.target.files && e.target.files[0]) {

      const i = new Image();
      const file = e.target.files[0];

      i.onload = () => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.setState({
            imageData: reader.result,
            width: i.width,
            height: i.height
          }, () => {
            this.props.onChange(reader.result);
          });
        };
      };

      i.src = URL.createObjectURL(file);

    }


  }

  render() {
    const { t } = this.props;
    const { imageData } = this.state;

    return (
      <div data-test-picture-profile>
        {!imageData ?
          <div className='default-profile-image'>
            <span>JL</span>
          </div> :
          <div className='thumbnail'>
            <img
              src={imageData}
              data-test-picture-uploaded
            />
          </div>
        }
        <div>
          <label
            htmlFor="hidden-profile-picture"
            className="ui icon button upload-button"
            data-test-upload-picture
          >{t('profile.uploadPicture')}</label>

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

export default translate('translations')(ImageProfile);
