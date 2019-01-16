import * as React from 'react';
import QueryAssist from 'react-query-assist';
import { IFilter } from '@data/containers/api/with-filtering';

// For use after MVP and resolution of this issue:
// https://github.com/timberio/react-query-assist/issues/25
// import Footer from './footer';

const inputProps = {
  fontSize: '16px',
  fontWeight: 300,
  fontFamily: 'monospace',
  lineHeight: '20px',
  p: '15px 20px',
};

const dropdownProps = {
  bg: '#4a4a4a',
  borderRadius: '2px',
  fontSize: '14px',
  fontWeight: 400,
};

const selectorProps = {
  bg: '#4a90e2',
  border: '1px solid #9b9b9b',
  color: '#FFFFFF',
};

interface IOwnProps {
  languages?: any;
  onSubmit: (results: any) => void;
}

type IProps = IOwnProps;

class Search extends React.Component<IProps> {
  buildOptions = () => {
    let { languages } = this.props;

    languages = languages || [];

    const completionData = [
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'language',
        type: 'string',
        enumerations: languages.map((l) => l.attributes.name),
      },
    ];

    return completionData;
  };

  render() {
    const { onSubmit } = this.props;
    const completionData = this.buildOptions();

    return (
      <QueryAssist
        data={completionData}
        onSubmit={onSubmit}
        inputProps={inputProps}
        dropdownProps={dropdownProps}
        selectorProps={selectorProps}
        listProps={{
          paddingLeft: '0px',
          marginLeft: '0px',
        }}
      />
    );
  }
}

export default Search;
