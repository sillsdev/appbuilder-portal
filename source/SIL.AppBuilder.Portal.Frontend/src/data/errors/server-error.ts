export class ServerError extends Error {
  status: number;
  text: string;

  constructor(status, text) {
    super(text);

    this.status = status;
    this.text = text;
  }
}
