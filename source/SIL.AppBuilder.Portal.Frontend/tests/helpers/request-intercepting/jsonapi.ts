export function respondWithJsonApi(status, responseJson, customize?: (req, res) => Promise<void>) {
  return async (req, res) => {
    if(customize !== undefined) {
      await customize(req, res);
    }
    res.status(status);
    res.headers['Content-Type'] = 'application/vnd.api+json';
    res.json(responseJson);
  };
}
