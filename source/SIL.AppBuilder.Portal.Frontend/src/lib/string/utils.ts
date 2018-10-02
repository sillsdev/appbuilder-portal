const TOKEN_REGEX = /(|\s)(\w+):/;

export interface IParsedTokens {
  [key: string]: any;
}

// example:
// 1.
//   'name:"hi" language:English*'
//   => ['name', 'hi', ' ', 'language', 'English*']
//
// 2.
//   'name:"hi" language:'
//   => ['name', 'hi', ' ', 'language']
//
// 3.
//   'name:"hi" language: something:'
//   => ['name', 'hi', ' ', 'language', ' ', 'something']
export function tokensToObject(search: string): IParsedTokens {
  if (search === '') {
    return {};
  }
  const tokens: string[] = search
    .split(TOKEN_REGEX)
    .filter(Boolean)
    .map(t => t.replace(/(^"|"$)/g, ""));

  const result: IParsedTokens = {};

  for(let i = 0; i < tokens.length; i++) {
    const token: string = tokens[i];

    if (token.match(/ /)) {
      continue;
    }

    const value = tokens[i + 1];

    if (value === undefined || value.match(/ /)) {
      result[token] = '';
      continue;
    }

    result[token] = value;
    // skip the value used this iteration
    i += 1;
  }

  return result;
}

