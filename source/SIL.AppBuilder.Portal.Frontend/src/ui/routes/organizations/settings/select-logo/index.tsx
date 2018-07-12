import * as React from 'react';

export interface IProps {
  onChange: (imageData: String) => void;
  value?: string;
}

export interface IState {
  imageData: String;
}

class SelectLogo extends React.Component<IProps, IState> {
  state = { imageData: null };

  componentWillReceiveProps(nextProps) {
    const { value } = nextProps;

    if (value) {
      this.setState({ imageData: value });
    }
  }

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
      <div className='flex-column'>
        <div className='m-b-md image-fill-container' style={{width: '200px', height: '136px' }}>
          { !imageData && <div className='w-100 h-100 bg-lightest-gray' />}
          { imageData && (
            <img src={imageData} />
          )}
        </div>

        <label
          htmlFor='hidden-logo-input'
          className="ui icon button secondary flex-grow uppercase">
          Select Logo
        </label>

        <input
          id='hidden-logo-input'
          type="file" style={{display: 'none'}}
          onChange={this.handleNewImage}
        />
      </div>
    );

  }

}

export default SelectLogo;
