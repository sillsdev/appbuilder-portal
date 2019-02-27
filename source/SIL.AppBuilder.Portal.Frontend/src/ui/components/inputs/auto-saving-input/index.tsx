import React, { useState } from 'react';
import { Form } from 'semantic-ui-react';
import { useDebouncedCallback } from 'use-debounce';

interface IProps {
  value: string;
  onChange: (value: any) => void;
  InputElement?: React.ComponentClass;
  timeout?: number;
}

interface IState {
  value: string;
}

export default function AutoSavingInput({ value, onChange, InputElement, timeout }: IProps) {
  const Input = InputElement || Form.TextArea;
  const [localValue, setLocalValue] = useState(value);
  const save = useDebouncedCallback((newValue) => onChange(newValue), timeout, []);

  const onInputChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;

    if (localValue === newValue) {
      return;
    }

    setLocalValue(newValue);
    save(newValue);
  };

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onChange(localValue);
  };

  return (
    <Form onSubmit={onFormSubmit}>
      <Input value={localValue} onBlur={onInputChange} onChange={onInputChange} />
    </Form>
  );
}
