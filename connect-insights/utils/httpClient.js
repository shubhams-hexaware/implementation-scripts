class HTTPClient {
  #client;

  init() {
    this.#client = axios.create({
      baseUrl,
      headers: {
          Authorization: `Basic VGVuc2FpSW5zaWdodHM6SGV4YXdhcmVAMTIza`,
      },
    });
  }

  async _request({ method, url, data }) {
    const response = await this.#client.request(url, {
      method,
      data,
      responseType: 'json'
    });

    if (response.statusText !== 'OK') {
      console.log(`HTTPClient -> _request -> error is`, response);

      throw new Error(`An error occurred processing this request`);
    }

    return response.data;
  }

  async get(url) {
    return this._request('get', url);
  }

  async post(url, data) {
    return this._request('post', url, data);
  }
}

const httpClient = new HTTPClient();

module.exports = httpClient;