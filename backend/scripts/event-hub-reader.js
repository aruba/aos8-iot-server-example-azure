/*
 * Microsoft Sample Code - Copyright (c) 2020 - Licensed MIT
 */

// eslint-disable-next-line no-unused-vars
const { EventHubProducerClient, EventHubConsumerClient } = require('@azure/event-hubs');
const { convertIotHubToEventHubsConnectionString } = require('./iot-hub-connection-string.js');

class EventHubReader {
  constructor(iotHubConnectionString, consumerGroup) {
    this.iotHubConnectionString = iotHubConnectionString;
    this.consumerGroup = consumerGroup;
  }

  async startReadMessage(startReadMessageCallback) {
    try {
      const eventHubConnectionString = await convertIotHubToEventHubsConnectionString(this.iotHubConnectionString);
      const consumerClient = new EventHubConsumerClient(this.consumerGroup, eventHubConnectionString);
      console.log('Successfully created the EventHubConsumerClient from IoT Hub event hub-compatible connection string.');

      const partitionIds = await consumerClient.getPartitionIds();
      console.log('The partition ids are: ', partitionIds);

      consumerClient.subscribe({
        processEvents: (events, context) => {
          for (let i = 0; i < events.length; ++i) {
            //console.log('events[i]: ', events[i]);
            //console.log('events[i].properties: ', events[i].properties);
            //console.log('events[i].systemProperties: ', events[i].systemProperties);
            // events[i].properties["deviceIdentifier"] is actual ble device,
            // events[i].systemProperties["iothub-connection-device-id"] is AP that reported the device

            startReadMessageCallback(
              events[i].properties,
              events[i].body,
              events[i].enqueuedTimeUtc,
              events[i].systemProperties['iothub-connection-device-id']);
          }
        },
        // eslint-disable-next-line no-unused-vars
        processError: (err, context) => {
          console.error(err.message || err);
        }
      });
    } catch (ex) {
      console.error(ex.message || ex);
    }
  }

  // Close connection to Event Hub.
  async stopReadMessage() {
    const disposeHandlers = [];
    this.receiveHandlers.forEach((receiveHandler) => {
      disposeHandlers.push(receiveHandler.stop());
    });
    await Promise.all(disposeHandlers);

    this.consumerClient.close();
  }
}

module.exports = EventHubReader;
