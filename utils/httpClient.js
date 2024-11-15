const axios = require("axios");

class HttpClient {
  #client;

  init(baseUrl, headers = {}) {
    this.#client = axios.create({
      baseURL: baseUrl,
      headers
    });
  }

  async _request({ method, url, data }) {
    const response = await this.#client.request({
      method,
      url,
      data,
    });

    if (response.statusText !== "OK") {
      console.error(`HTTPClient -> _request -> error is`, response);
      throw new Error(`An error occurred calling ${url}`);
    }

    return response.data;
  }

  async get(url) {
    return this._request({
      method: "get",
      url
    });
  }

  async post(url, data) {
    return this._request({
      method: "post",
      url,
      data
    });
  }
}

const httpClient = new HttpClient();

module.exports = httpClient;