import httpClient from "../utils/httpClient.js";
import moment from "moment";

class AmazonConnectHelper {

  constructor(apiUrl) {
    httpClient.init(apiUrl);
  }
  /**
   * Helper method to get a list of Contact Flows for the current tenant
   * @returns {Promise<Array[object]>}
   */
  async getContactFlowsHelper() {
    const response = await httpClient.get('/realtime-stats/list-contactflows');
    return response.ContactFlowSummaryList;
  }

  /**
   * Helper to get the errors for the provided contact flow.
   * @param startTimestamp {string} the start date & time in yyyy-mm-dd HH:mm:ss format
   * @param endTimestamp {string} the end date & time in yyyy-mm-dd HH:mm:ss format
   * @param contactFlowName {string} the name of the contact flow as obtained from th getContactFlowsHelper.
   * @returns {Promise<Array[object]>}
   */
  async getContactFlowErrorsHelper({ startTimestamp, endTimestamp, contactFlowName }) {
    return httpClient.post({
      startTimestamp,
      endTimestamp,
      contactFlowName,
    });
  }

  /**
   * Helper to get the list of queues
   * @returns {Promise<Array[object]>}
   */
  async getQueuesListHelper() {
    return httpClient.get('/realtime-stats/list-queues');
  }

  /**
   * Helper to get the Queue Capacity exceeded errors for the queue name and dates.
   * @param startDateTime {string} the start date & time in yyyy-mm-dd HH:mm:ss format
   * @param endDateTime {string} the end date & time in yyyy-mm-dd HH:mm:ss format
   * @param queueName {string} the name of the queue as obtained from the getQueuesListHelper
   * @returns {Promise<Array[object]>}
   */
  async getQueueCapacityExceededErrorsHelper({ startDateTime, endDateTime, queueName }) {
    const startTimestamp = moment(startDateTime, "YYYY-MM-DD HH:mm:ss")
      .utc(true)
      .unix();

    const endTimestamp = moment(endDateTime, "YYYY-MM-DD HH:mm:ss")
      .utc(true)
      .unix();

    return httpClient.post(
      '/cloudwatch-stats/queue-capacity-exceeded-error',
      {
        startTimestamp,
        endTimestamp,
        queueName,
      }
    );
  }

  /**
   * Helper to get the CTR Denormalized data for the dates provided.
   * @param startDateTime {string} the start date & time in YYYY-MM-DD HH:mm:ss format
   * @param endDateTime {string} the end date & time in YYYY-MM-DD HH:mm:ss format
   * @returns {Promise<Array[object]>}
   */
  async getCTRDenormalizedHelper({ startDateTime, endDateTime }) {
    // const startTimestamp = moment(startDateTime, "YYYY-MM-DD HH:mm:ss")
    //   .utc(true)
    //   .format('YYYY');
    //
    // const endTimestamp = moment(endDateTime, "YYYY-MM-DD HH:mm:ss")
    //   .utc(true);

    return httpClient.post(
      '/historical-stats/ctr-denormalized',
      {
        startTimestamp: startDateTime,
        endTimestamp: endDateTime,
      }
    )
  }

  /**
   * Helper to get the signed recording URL
   * @param recordingLocation {string} the recording location
   * @returns {Promise<string>}
   */
  async getRecordingURLHelper(recordingLocation) {
    return httpClient.post(
      '/realtime-stats/get-signed-recording-url',
      { recordingLocation }
    );
  }

  /**
   * Helper to get the contact lens denormalized data between the dates provided.
   * @param startDate {string} the start date in the format YYYY-MM-DD
   * @param endDate {string} the start date in the format YYYY-MM-DD
   * @returns {Promise<Array[object]>}
   */
  async getContactLensDenormalizedHelper({ startDate, endDate }) {
    return httpClient.post(
      '/historical-stats/contact-lens-denormalized',
      {
        startDate,
        endDate
      }
    );
  }

  /**
   * Helper to get the calls per second between the dates provided.
   * @param startDateTime {string} the start date & time in the format YYYY-MM-DD HH:mm:ss
   * @param endDateTime {string} the end date & time in the format YYYY-MM-DD HH:mm:ss
   * @returns {Promise<Array[object]>}
   */
  async getCallsPerSecondHelper({ startDateTime, endDateTime }) {
    const startTimestamp = moment(startDateTime, "YYYY-MM-DD HH:mm:ss")
      .utc(true)
      .unix();

    const endTimestamp = moment(endDateTime, "YYYY-MM-DD HH:mm:ss")
      .utc(true)
      .unix();

    return httpClient.post(
      '/cloudwatch-stats/calls-per-second',
      {
        startTimestamp,
        endTimestamp
      }
    );
  }
}

export default AmazonConnectHelper;