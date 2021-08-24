const config = {};


/* IoTHub required config variables */
// your IotHub Connection String
// Value Format: HostName=<Host Name>;SharedAccessKeyName=<Key Name>;SharedAccessKey=<SAS Key>
config.iothubconnectionstring = process.env.IotHubConnectionString;
// your event hub consumer group
// ex:
config.eventhubconsumergroup = process.env.EventHubConsumerGroup;

/* Database required config variables */
// host of your azure for postgres server
// ex: arubawebappdb.postgres.database.azure.com)
config.host = process.env.DBHOST;
// valid user for your database
// ex: chucksarj@arubawebappdb
config.user = process.env.DBUSER;
// password for user
config.password = process.env.DBPASSWORD;
// database for server
// ex: arubapostgresdb
config.database = process.env.DATABASE;

if (config.host.includes("https://localhost:")) {
  console.log("Local environment detected");
  console.log("WARNING: Disabled checking of self-signed certs. Do not have this code in production.");
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  console.log(`Go to http://localhost:${process.env.PORT || '3000'} to try the sample.`);
}

module.exports = config;