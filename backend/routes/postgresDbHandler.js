let today = new Date();
let dd = today.getDate();
let mm = today.getMonth() + 1;
let yyyy = today.getFullYear();
if (dd < 10) {
  dd = '0' + dd;
}
if (mm < 10) {
  mm = '0' + mm;
}
today = mm + '/' + dd + '/' + yyyy;

class postgresDbHandler {
   /**
    * InitHandles the various APIs for displaying and managing tasks
    * @param {pgClient} pgClient
    */
   constructor(pgClient) {
     this.pgClient = pgClient;
   }

   async getBleDataAp(req, res) {
     const payload = JSON.parse(req.body.body);
     const device = payload.device;
     const query = `SELECT access_points FROM bledevtable WHERE device_identifier = '` + device + `';`;

     await this.pgClient.query(query, (err, queryres) => {
       if (err) {
         console.error(err);
         return;
       }

       res.send({data: queryres.rows});
     });
   }

   // params: valid ble device, valid day, valid ap
   async getChartData(req, res) {
     const payload = JSON.parse(req.body.body);
     const dev = payload.dev;
     const day = payload.date;
     const ap = payload.ap;

     const query = `SELECT rssi, time FROM tsdatahypertable WHERE tsdatahypertable.date = '` + day + `' AND tsdatahypertable.device = '` + dev + `' AND tsdatahypertable.ap = '` + ap + `';`;

     await this.pgClient.query(query, (err, queryres) => {
       if (err) {
         console.error(err);
         return;
       }

       res.send({data: queryres.rows});
     });
   }

   async getApProfile(req, res) {
     const dev = req.query.dev;

     const query = `SELECT * FROM aptable WHERE aptable.device_id = '` + dev + `';`;

     await this.pgClient.query(query, (err, queryres) => {
       if (err) {
         console.error(err);
         return;
       }

       res.send({data: queryres.rows});
     });
   }

   async getRadioProfile(req, res) {
     const dev = req.query.dev;

     const query = `SELECT * FROM radiotable WHERE radiotable.mac_addr = '` + dev + `';`;

     await this.pgClient.query(query, (err, queryres) => {
       if (err) {
         console.error(err);
         return;
       }

       res.send({data: queryres.rows});
     });
   }

   async getUsbProfile(req, res) {
     const dev = req.query.dev;

     const query = `SELECT * FROM usbtable WHERE usbtable.id = '` + dev + `';`;

     await this.pgClient.query(query, (err, queryres) => {
       if (err) {
         console.error(err);
         return;
       }

       res.send({data: queryres.rows});
     });
   }

   async getTableData(req, res) {
     //console.log("req:", req);
     const payload = JSON.parse(req.body.body);
     const date = payload.date;
     const query = `SELECT * FROM tsdatahypertable WHERE tsdatahypertable.date = '` + date + `' ORDER BY time DESC;`;

     await this.pgClient.query(query, (err, queryres) => {
       if (err) {
         console.error(err);
         return;
       }

       res.send({data: queryres.rows});
     });
   }

   async getDates(req, res) {
     const query = `SELECT DISTINCT date FROM tsdatahypertable ORDER BY date DESC`;

     await this.pgClient.query(query, (err, queryres) => {
       if (err) {
         console.error(err);
         return;
       }

       res.send({data: queryres.rows});
     });
   }

   // get
   async getChartDates(req, res) {
     const dev = req.query.dev;

     const query = `SELECT DISTINCT date FROM tsdatahypertable WHERE device = '` + dev + `' ORDER BY date DESC;`;

     await this.pgClient.query(query, (err, queryres) => {
       if (err) {
         console.error(err);
         return;
       }

       res.send({data: queryres.rows});
     });
   }

   // post
   async getChartAps(req, res) {
     const payload = JSON.parse(req.body.body);

     const query = `SELECT DISTINCT ap FROM tsdatahypertable WHERE device = '` + payload.dev + `' AND date = '` + payload.date + `';`;

     await this.pgClient.query(query, (err, queryres) => {
       if (err) {
         console.error(err);
         return;
       }

       res.send({data: queryres.rows});
     });
   }

   query(query_string, dev) {
      return new Promise((resolve, reject) => {
          this.pgClient.query(query_string, (err, res) => {
              if (err) {
                  console.log(err.stack)
                  reject(err)
              } else {
                resolve({"dev": dev, "rssi": res.rows[0].avg})
              }
          })
      })
   }

   async getAvgRssi(req, res) {
     const payload = JSON.parse(req.body.body);
     let tmp = [];

     var array_of_promises = [], array_of_results = []
     payload.devs.forEach( item => {
       let tmpq = `SELECT AVG(rssi)::numeric(10,2) FROM tsdatahypertable WHERE device = '` + item.name + `' AND ap = '` + payload.ap + `';`;
       array_of_promises.push(this.query(tmpq, item.name));
     });
     array_of_results = await Promise.all(array_of_promises);

     res.send({data: array_of_results});
   }

   // get all data from a table
   async getAllData(req, res) {
     const table = req.params.type;
     const query = `SELECT * FROM ` + table + `;`;

     await this.pgClient.query(query, (err, queryres) => {
       if (err) {
         console.error(err);
         return;
       }

       res.send({data: queryres.rows});
     });
   }

   // post request endpoint, query with req body
   /*async addData(req, res) {
     const table = req.params.type;
     //console.log(table);
     let query = null;
     const payload = JSON.parse(req.body.body);
     //console.log(payload);

     if (table === "ts") {
       query = `
        INSERT INTO tsdatahypertable (date, time, device, rssi, ble_data, frame_type, mac_addr_type, ap)
        VALUES ('` + today + `', '` + payload.time + `', '` + payload.device + `', '` + payload.rssi + `', '` + payload.ble_data + `', '` + payload.frame_type + `', '` + payload.mac_type + `', '` + payload.ap + `');`;
     } else if (table === "radio") {
       query = `
        INSERT INTO radiotable (mac_addr, type, firmware, last_health_status, external)
        VALUES ('` + payload.mac + `', '` + payload.type + `', '` + payload.firmware + `', '` + payload.health + `', '` + payload.external + `')
        ON CONFLICT (mac_addr)
        DO
        UPDATE SET type = '` + payload.type + `', firmware = '` + payload.firmware + `', last_health_status = '` + payload.health + `', external = '` + payload.external + `'
        WHERE radiotable.mac_addr = '` + payload.mac + `';`;
     } else if (table === "usb") {
       query = `
        INSERT INTO usbtable (id, last_health_status)
        VALUES ('` + payload.id + `', '` + payload.health + `')
        ON CONFLICT (id)
        DO
        UPDATE SET last_health_status = '` + payload.health + `'
        WHERE usbtable.id = '` + payload.id + `';`;
     } else if (table === "ap") {
       if (payload.hasOwnProperty("health")) {
         query = `
          INSERT INTO aptable (device_id, last_health_status, usb_devices, radio_devices, ble_devices)
          VALUES ('` + payload.devId + `', '`+ payload.health +`', '{}', '{}', '{}')
          ON CONFLICT (device_id)
          DO
          UPDATE SET last_health_status = '` + payload.health + `'
          WHERE aptable.device_id='` + payload.devId + `';`;
       } else if (payload.hasOwnProperty("bleId")) {
         query = `
          INSERT INTO aptable (device_id, last_health_status, usb_devices, radio_devices, ble_devices)
          VALUES ('` + payload.devId + `', 'unknown', '{}', '{}', '{` +payload.bleId+ `}')
          ON CONFLICT (device_id)
          DO
          UPDATE SET ble_devices = (SELECT ARRAY_AGG(DISTINCT e) FROM UNNEST(aptable.ble_devices || '{` + payload.bleId +`}') e)
          WHERE NOT aptable.ble_devices @> '{` + payload.bleId +`}' AND aptable.device_id = '` + payload.devId + `';`;
       } else if (payload.hasOwnProperty("usbId")) {
         // usb can't exist without an ap i.e there has to be an entry already -> so just update
         query = `
          UPDATE aptable SET usb_devices = (SELECT ARRAY_AGG(DISTINCT e) FROM UNNEST(aptable.usb_devices || '{` + payload.usbId +`}') e)
          WHERE NOT aptable.usb_devices @> '{` + payload.usbId +`}' AND aptable.device_id = '` + payload.devId + `';`;
       } else if (payload.hasOwnProperty("radioId")) {
         // radio can't exist without an ap i.e there has to be an entry already -> so just update
         query = `
          UPDATE aptable SET radio_devices = (SELECT ARRAY_AGG(DISTINCT e) FROM UNNEST(aptable.radio_devices || '{` + payload.radioId +`}') e)
          WHERE NOT aptable.radio_devices @> '{` + payload.radioId +`}' AND aptable.device_id = '` + payload.devId + `';`;
       }
     } else if (table === "ble") {
       query = `
        INSERT INTO bledevtable (device_identifier, access_points)
        VALUES ('` + payload.bledevId + `', '{` + payload.apId + `}')
        ON CONFLICT (device_identifier)
        DO
        UPDATE SET access_points = (SELECT ARRAY_AGG(DISTINCT e) FROM UNNEST(bledevtable.access_points || '{` + payload.apId +`}') e)
        WHERE NOT bledevtable.access_points @> '{` + payload.apId +`}' AND bledevtable.device_identifier = '` + payload.bledevId + `';`;
     } else {
       console.log("unsupported option")
     }

     //console.log(query);
     await this.pgClient.query(query, (err, res) => {
       if (err) {
         console.error(err);
         return;
       }
       console.log('Data insert successful');
     });
   }*/
}

module.exports = postgresDbHandler;