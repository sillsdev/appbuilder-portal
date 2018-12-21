export class CurrentUserFetchError extends Error {
  text: string;

  constructor(text) {
    super(text);

    this.text = text;
  }
}
