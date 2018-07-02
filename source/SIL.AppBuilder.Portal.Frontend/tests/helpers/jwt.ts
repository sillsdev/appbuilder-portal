import * as CryptoJS from 'crypto-js';

// inspiration from: https://codepen.io/jpetitcolas/pen/zxGxKN
export function fakeAuth0JWT(data = {}) {

  const header = objectToJWTPartial({ alg: 'HS256', typ: 'JWT' });
  const payload = objectToJWTPartial({
    sub: 'whatever-user-id',
    exp: new Date().getTime() + 3600000,
    ...data
  });
  const signature = `${header}.${payload}`;


  return `${header}.${payload}.${signature}`;
}

function objectToJWTPartial(obj) {
  const utf8 = CryptoJS.enc.Utf8.parse(JSON.stringify(obj));

  return toBase64(utf8);
}

function toBase64(str) {
  // Encode in classical base64
  let encodedSource = CryptoJS.enc.Base64.stringify(str);

  // Remove padding equal characters
  encodedSource = encodedSource.replace(/=+$/, '');

  // Replace characters according to base64url specifications
  encodedSource = encodedSource.replace(/\+/g, '-');
  encodedSource = encodedSource.replace(/\//g, '_');

  return encodedSource;
}

function sign(data) {
  const signature = CryptoJS.HmacSHA256(data, 'secret secret, I got a secret');

  return toBase64(signature);
}
