const config = {};

// add www environmental variables reading here

config.host = process.env.DBHOST || "[host of your azure for postgres server (ex: arubawebappdb.postgres.database.azure.com)]";
config.user = process.env.DBUSER || "[valid user for postgres db (ex: chucksarj@arubawebappdb)]";
config.password = process.env.DBPASSWORD || "[password for user]";
config.database = process.env.DATABASE || "[database for server (ex: arubapostgresdb)]";

if (config.host.includes("https://localhost:")) {
  console.log("Local environment detected");
  console.log("WARNING: Disabled checking of self-signed certs. Do not have this code in production.");
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  console.log(`Go to http://localhost:${process.env.PORT || '3000'} to try the sample.`);
}

module.exports = config;