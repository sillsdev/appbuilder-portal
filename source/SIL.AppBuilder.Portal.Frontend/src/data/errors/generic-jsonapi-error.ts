export class GenericJsonApiError extends Error {
  status: number;
  json: any;

  constructor(status, text, json) {
    super(text);

    this.status = status;
    this.json = json;
  }
}