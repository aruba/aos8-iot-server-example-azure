/* 
 * Copyright 2022 Hewlett Packard Enterprise Development LP. 
 */

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
    * @param {PG.Pool} pgClient
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

     var array_of_promises = [], array_of_results = [];
     payload.devs.forEach( item => {
       let tmpq = `SELECT AVG(rssi)::numeric(10,2) FROM tsdatahypertable WHERE device = '` + item.name + `' AND ap = '` + payload.ap + `';`;
       array_of_promises.push(this.query(tmpq, item.name));
     });
     array_of_results = await Promise.all(array_of_promises);

     res.send({data: array_of_results});
   }

   async getAvgRssiBle(req, res) {
     const payload = JSON.parse(req.body.body);

     var array_of_promises = [], array_of_results = [];
     payload.aps.forEach( item => {
         console.log("backend", item);
       let tmpq = `SELECT AVG(rssi)::numeric(10,2) FROM tsdatahypertable WHERE device = '` + payload.dev + `' AND ap = '` + item + `';`;
       array_of_promises.push(this.query(tmpq, item));
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
}

module.exports = postgresDbHandler;