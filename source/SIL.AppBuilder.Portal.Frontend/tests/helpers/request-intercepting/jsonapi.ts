export function respondWithJsonApi(status, responseJson) {
  return (req, res) => {
    res.status(status);
    res.headers['Content-Type'] = 'application/vnd.api+json';
    res.json(responseJson);
  };
}
