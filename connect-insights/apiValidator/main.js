/**
 * This script is to check the Connect Insights API calls for a tenant prior to implementation.
 */

const axios = require('axios');
const prompt = require('async-prompt');
const moment = require('moment');
    


/* UTILS */

function formatBaseUrl(rawUrl) {
  rawUrl = rawUrl.includes('api') ? rawUrl : `${rawUrl}/api/`;

  return rawUrl.charAt(rawUrl.length - 1) === '/' ? rawUrl : `${rawUrl}/`;
}

async function getContactFlows() {
  console.log(`getContactFlows -> begin`);

  const data = await httpClient.get('/realtime-stats/list-contactflows');

  return { data, payload: {} };
}

async function getContactFlowErrors(contactFlowName) {
  console.log(`getContactFlowErrors -> begin`);

  const startTimestamp = moment().subtract(1, 'days').startOf('day').unix();
  console.log(`getContactFlowErrors -> start timestamp is ${startTimestamp}`);

  const endTimestamp = moment().subtract(1, 'days').endOf('day').unix();
  console.log(`getContactFlowErrors -> end timestamp is ${endTimestamp}`);

  const data = await httpClient.post('/cloudwatch-stats/contact-flow-errors', {
    startTimestamp,
    endTimestamp,
    contactFlowName,
  });

  return {
    data,
    payload: {
      startTimestamp,
      endTimestamp,
      contactFlowName,
    },
  };
}

async function getQueues() {
  console.log(`getQueues -> begin`);

  const data = await httpClient.get('/realtime-stats/list-queues');

  return {
    data,
    payload: {},
  };
}

async function getQueueCapacityExceededErrors(queueName) {
  console.log(`getQueueCapacityExceededErrors -> begin`);

  const startTimestamp = moment().subtract(1, 'days').startOf('day').unix();
  console.log(`getQueueCapacityExceededErrors -> start timestamp is ${startTimestamp}`);

  const endTimestamp = moment().subtract(1, 'days').endOf('day').unix();
  console.log(`getQueueCapacityExceededErrors -> end timestamp is ${endTimestamp}`);

  const data = await httpClient.post('/cloudwatch-stats/queue-capacity-exceeded-error', {
    startTimestamp,
    endTimestamp,
    queueName,
  });

  return {
    data,
    payload: {
      startTimestamp,
      endTimestamp,
      queueName,
    },
  };
}

async function getCtrDenormalized() {
  console.log(`getCtrDenormalized -> begin`);

  const startTimestamp = moment().subtract(1, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss');
  console.log(`getCtrDenormalized -> start timestamp is ${startTimestamp}`);

  const endTimestamp = moment().subtract(1, 'days').endOf('day').format('YYYY-MM-DD HH:mm:ss');
  console.log(`getCtrDenormalized -> end timestamp is ${endTimestamp}`);

  const data = await httpClient.post('/historical-stats/ctr-denormalized', {
    startTimestamp,
    endTimestamp,
  });

  return {
    data,
    payload: {
      startTimestamp,
      endTimestamp,
    },
  };
}

async function getSignedRecordingUrl(recordingLocation) {
  console.log(`getSignedRecordingUrl -> begin`);
  console.log(`getSignedRecordingUrl -> recording location is ${recordingLocation}`);

  const data = await httpClient.post('/realtime-stats/get-signed-recording-url', {
    recordingLocation,
  });

  return {
    data,
    payload: {
      recordingLocation,
    },
  };
}

async function getContactLensDenormalized() {
  console.log(`getContactLensDenormalized -> begin`);

  const startDate = moment().subtract(1, 'days').startOf('day').format('YYYY-MM-DD');
  console.log(`getContactLensDenormalized -> start date is ${startDate}`);
  
  const endDate = moment().subtract(1, 'days').endOf('day').format('YYYY-MM-DD');
  console.log(`getContactLensDenormalized -> end date is ${endDate}`);

  const result = await httpClient.post('/historical-stats/contact-lens-denormalized', {
    startDate,
    endDate,
  });

  return {
    result,
    payload: {
      startDate,
      endDate,
    },
  };
}

async function getCallsPerSecond() {
  console.log(`getCallsPerSecond -> begin`);

  const startTimestamp = moment().subtract(1, 'days').startOf('day').unix();
  console.log(`getCallsPerSecond -> start timestamp is ${startTimestamp}`);

  const endTimestamp = moment().subtract(1, 'days').endOf('day').unix();
  console.log(`getCallsPerSecond -> end timestamp is ${endTimestamp}`);

  const data = await httpClient.post('/cloudwatch-stats/calls-per-second', {
    startTimestamp,
    endTimestamp,
  });

  return {
    data,
    payload: {
      startTimestamp,
      endTimestamp,
    },
  };
}

async function validateContactFlowErrors() {
  console.log(`validateContactFlow -> begin`);

  const contactFlows = await getContactFlows();

  // creating a list of contact flow names
  const contactFlowNames = contactFlows.map(_contactFlow => _contactFlow.Name);

  // call the contact flow errors API with different contact flows until we get a response.
  let counter = 0;
  while (counter < contactFlowNames.length) {
    const currentFlowName = contactFlowNames[counter];

    const contactFlowErrorsResponse = await getContactFlowErrors(currentFlowName);

    if (contactFlowErrorsResponse.length) {
      console.log(`validateContactFlowErrors -> found data for ${currentFlowName}`);

      break;
    }

    counter++;
  }

  // write the contact flow names and response the file.
}

async function validateQueues() {
  console.log(`validateQueues -> begin`);

  const queues = await getQueues();

  const queueNames = queues.map(_queue => _queue.Name);

  let counter = 0;
  while (counter < queueNames.length) {
    const currentQueueName = queueNames[counter];

    const getQueueCapacityResponse = await getQueueCapacityExceededErrors(currentQueueName);

    if (getQueueCapacityResponse.length) {
      console.log(`validateQueues -> got a response for ${queueName} queue`);

      break;
    }

    counter++;
  }

  // write the response
}

async function validateCallRecording() {
  console.log(`validateCallRecording -> begin`);

  const ctrResponse = await getCtrDenormalized();

  const recordingLocations = ctrResponse.map(_record => _record.recording_location)
    .slice(0, 5);

  const signedRecordingUrls = [];

  for (let counter = 0; counter < recordingLocations.length; counter++) {
    const currentRecording = recordingLocations[counter];

    const signedUrl = await getSignedRecordingUrl(currentRecording);

    signedRecordingUrls.push(signedUrl);
  }

  // write the response
}

(async function main() {
  const rawBaseUrl = prompt(`Enter the Base URL for the tenant `);
  
  const baseUrl = formatBaseUrl(rawBaseUrl);

  // invoke the contact flows API to get a list of flows

  const contactLensDenormalizedResponse = await getContactLensDenormalized();
  const callsPerSecondResponse = await getCallsPerSecond();
})();
    
    