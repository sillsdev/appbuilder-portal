import * as React from 'react';
import { Form } from 'semantic-ui-react';
import { debounceInput } from '@lib/debounce';

interface IProps {
  value: string;
  onChange: (value: any) => void;
  InputElement?: React.ComponentClass;
  timeout?: number;
}

interface IState {
  value: string;
}

export default class AutoSavingInput extends React.Component<IProps, IState> {
  state = { value: '' };
  onInputChange: (e: React.FormEvent<any>) => void;

  constructor(props: IProps) {
    super(props);

    this.state = { value: props.value };
    this.onInputChange = debounceInput(this, {
      delayMs: this.props.timeout || 750,
      onTrigger() {
        const { value } = this.state;

        this.props.onChange(value);
      },
    });
  }

  onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    this.props.onChange(this.state.value);
  };

  render() {
    const { value: sValue } = this.state;
    const { value: pValue, InputElement } = this.props;
    const Input = InputElement || Form.TextArea;
    const value = sValue || pValue;

    return (
      <Form onSubmit={this.onFormSubmit}>
        <Input value={value} onBlur={this.onInputChange} onChange={this.onInputChange} />
      </Form>
    );
  }
}
