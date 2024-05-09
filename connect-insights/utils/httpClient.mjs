import axios from "axios";
import configuration from "../config.mjs";

class HttpClient {
  #client;

  init(baseUrl) {
    this.#client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Authorization': 'Basic VGVuc2FpSW5zaWdodHM6SGV4YXdhcmVAMTIza'
      },
    });
  }

  async _request({ method, url, data }) {
    const response = await this.#client.request({
      method,
      url,
      data,
    });

    if (response.statusText !== 'OK') {
      console.error(`HTTPClient -> _request -> error is`, response);
      throw new Error(`An error occurred calling ${url}`);
    }

    return response.data;
  }

  async get(url) {
    return this._request({
      method: 'get',
      url
    });
  }

  async post(url, data) {
    return this._request({
      method: 'post',
      url,
      data
    });
  }
}

const httpClient = new HttpClient();

export default httpClient;