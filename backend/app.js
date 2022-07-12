/* 
 * Copyright 2022 Hewlett Packard Enterprise Development LP. 
 */

const config = require('./config')
const express = require('express')
const path = require('path')
const cors = require('cors')
const logger = require('morgan')
const { Pool } = require('pg')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const postgresDbHandler = require("./routes/postgresDbHandler");
var Client = require('azure-iothub').Client;
var Message = require('azure-iot-common').Message;
var connectionString = config.iothubconnectionstring;

// set this to true to run set up queries for schema
const dbsetup = true;

const app = express()

// pg client for frontend endpoints
const pgConfig = {
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    port: 5432,
    ssl: true,
    max: 1000, //TODO: explore this number
    idleTimeoutMillis: 300000,
    connectionTimeoutMillis: 200000,
}

const pgPool = new Pool(pgConfig)

const pgHandler = new postgresDbHandler(pgPool)


if (dbsetup) {
    const queryTimescale = `CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;`;
    pgPool.query(queryTimescale, (err, res) => {
        if (err) {
            console.error(err);
            return;
        }

        console.log('timescale extension created');
    });

    const queryTsdatahypertable = `CREATE TABLE IF NOT EXISTS tsdatahypertable (time TIMESTAMPTZ NOT NULL, device TEXT NOT NULL, rssi SMALLINT NOT NULL, ble_data TEXT NOT NULL, frame_type TEXT NOT NULL, mac_addr_type TEXT NOT NULL, ap TEXT NOT NULL, date TEXT);`;
    pgPool.query(queryTsdatahypertable, (err, res) => {
        if (err) {
            console.error(err);
            return;
        }

        console.log('timeseries db table created');
    });

    const queryCreateHyperTable = `SELECT create_hypertable('tsdatahypertable', 'time', if_not_exists => TRUE);`;
    pgPool.query(queryCreateHyperTable, (err, res) => {
        if (err) {
            console.error(err);
            return;
        }

        console.log('db converted to timescale db');
    });

    const queryRadioTable = `CREATE TABLE IF NOT EXISTS radiotable (mac_addr TEXT PRIMARY KEY, type TEXT NOT NULL, firmware TEXT NOT NULL, last_health_status TEXT NOT NULL, external BOOLEAN NOT NULL);`;
    pgPool.query(queryRadioTable, (err, res) => {
        if (err) {
            console.error(err);
            return;
        }

        console.log('radio db table created');
    });

    const queryUsbTable = `CREATE TABLE IF NOT EXISTS usbtable (id TEXT PRIMARY KEY, last_health_status TEXT NOT NULL);`;
    pgPool.query(queryUsbTable, (err, res) => {
        if (err) {
            console.error(err);
            return;
        }

        console.log('usb db table created');
    });

    const queryApTable = `CREATE TABLE IF NOT EXISTS aptable (device_id TEXT PRIMARY KEY, last_health_status TEXT NOT NULL, usb_devices TEXT[] NOT NULL, radio_devices TEXT[] NOT NULL, ble_devices TEXT[] NOT NULL);`;
    pgPool.query(queryApTable, (err, res) => {
        if (err) {
            console.error(err);
            return;
        }

        console.log('ap db table created');
    });

    const queryBleTable = `CREATE TABLE IF NOT EXISTS bledevtable (device_identifier TEXT PRIMARY KEY, access_points TEXT[] NOT NULL);`;
    pgPool.query(queryBleTable, (err, res) => {
        if (err) {
            console.error(err);
            return;
        }

        console.log('ble db table created');
    });
}

function printResultFor(op) {
      return function printResult(err, res) {
        if (err) {
            console.log(op + ' error: ' + err.toString());
        }
        if (res) {
            console.log(op + ' status: ' + res.constructor.name);
        }
      };
}

function receiveFeedback(err, receiver){
      receiver.on('message', function (msg) {
        console.log('Feedback message:')
        console.log(msg.getData().toString('utf-8'));
      });
}

function sendC2d(targetdev, propdev, action, proptype) {
    'use strict';

    var targetDevice = targetdev;

    var serviceClient = Client.fromConnectionString(connectionString);

    serviceClient.open(function (err) {
      if (err) {
        console.error('Could not connect: ' + err.message);
      } else {
        console.log('Service client connected');
        serviceClient.getFeedbackReceiver(receiveFeedback);
        var message = new Message(JSON.stringify(action));
        message.ack = 'full';
        message.contentType = 'application/json';
        if (proptype === "bleActions") {
            message.properties.add('messageId', '12345678');
            message.properties.add('contentType', 'application/json');
            message.properties.add('messageType', 'bleActions');
            message.properties.add('deviceIdentifier', propdev);
        } else if (proptype === "characteristics") {
            message.properties.add('version', '1');
            message.properties.add('messageType', 'characteristics');
            message.properties.add('deviceIdentifier', propdev);
        }

        //message.messageId = "My Message ID";
        console.log('Sending message: ' + message.getData(), message);
        serviceClient.send(targetDevice, message, printResultFor('send'));
      }
    });
}

app.use(cors())
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
    res.send('hello world');
});

// done
app.post('/southbound/connect', function (req, res) {
    const payload = JSON.parse(req.body.body);

    let action = {
        "actionType": "bleConnect",
        "timeout": "30"
    };

    let properties = {
        'messageId': '12345678',
        'contentType': 'application/json',
        'messageType': 'bleActions',
        'deviceIdentifier': payload.dev
    }

    sendC2d(payload.ap, payload.dev, action, "bleActions");

    res.send({payload: action, props: properties});
})

// done
app.post('/southbound/disconnect', function (req, res) {
    const payload = JSON.parse(req.body.body);

    let action = {
        "actionType": "bleDisconnect",
        "timeout": "30"
    };

    let properties = {
        'messageId': '12345678',
        'contentType': 'application/json',
        'messageType': 'bleActions',
        'deviceIdentifier': payload.dev
    }

    sendC2d(payload.ap, payload.dev, action, "bleActions");

    res.send({payload: action, props: properties});
})


app.post('/southbound/read', function (req, res) {
    const payload = JSON.parse(req.body.body);

    let action = {
        "actionType": "bleGattRead",
        "serviceUuid": payload.serviceUuid,
        "characteristicUuid": payload.characteristicUuid,
        "timeout": 30
    };

    let properties = {
        'messageId': '12345678',
        'contentType': 'application/json',
        'messageType': 'bleActions',
        'deviceIdentifier': payload.dev
    }

    sendC2d(payload.ap, payload.dev, action, "bleActions");

    res.send({payload: action, props: properties});
})

app.post('/southbound/writeWithoutResponse', function (req, res) {
    const payload = JSON.parse(req.body.body);

    let action = {
        "actionType": "bleGattWrite",
        "serviceUuid": payload.serviceUuid,
        "characteristicUuid": payload.characteristicUuid,
        "data": payload.data,
        "timeout": 30
    };

    let properties = {
        'messageId': '12345678',
        'contentType': 'application/json',
        'messageType': 'bleActions',
        'deviceIdentifier': payload.dev
    }

    sendC2d(payload.ap, payload.dev, action, "bleActions");

    res.send({payload: action, props: properties});
})

app.post('/southbound/writeWithResponse', function (req, res) {
    const payload = JSON.parse(req.body.body);

    let action = {
        "actionType": "bleGattWriteWithResponse",
        "serviceUuid": payload.serviceUuid,
        "characteristicUuid": payload.characteristicUuid,
        "data": payload.data,
        "timeout": 30
    };

    let properties = {
        'messageId': '12345678',
        'contentType': 'application/json',
        'messageType': 'bleActions',
        'deviceIdentifier': payload.dev
    }

    sendC2d(payload.ap, payload.dev, action, "bleActions");

    res.send({payload: action, props: properties});
})

app.post('/southbound/notify', function (req, res) {
    const payload = JSON.parse(req.body.body);

    let action = {
        "actionType": "bleGattNotification",
        "serviceUuid": payload.serviceUuid,
        "characteristicUuid": payload.characteristicUuid,
        "subscription": payload.subscription,
        "timeout": 30
    };

    let properties = {
        'messageId': '12345678',
        'contentType': 'application/json',
        'messageType': 'bleActions',
        'deviceIdentifier': payload.dev
    }

    sendC2d(payload.ap, payload.dev, action, "bleActions");

    res.send({payload: action, props: properties});
})

app.post('/southbound/indicate', function (req, res) {
    const payload = JSON.parse(req.body.body);

    let action = {
        "actionType": "bleGattIndication",
        "serviceUuid": payload.serviceUuid,
        "characteristicUuid": payload.characteristicUuid,
        "subscription": payload.subscription,
        "timeout": 30
    };

    let properties = {
        'messageId': '12345678',
        'contentType': 'application/json',
        'messageType': 'bleActions',
        'deviceIdentifier': payload.dev
    }

    sendC2d(payload.ap, payload.dev, action, "bleActions");

    res.send({payload: action, props: properties});
})

app.post('/southbound/characteristicupdate', function (req, res) {
    const payload = JSON.parse(req.body.body);

    let action = {
        "deviceMac": payload.dev,
        "serviceUuid": payload.serviceUuid,
        "characteristicUuid": payload.characteristicUuid,
        "value": payload.value
    };

    let properties = {
        'version': '1',
        'messageType': 'characteristics',
        'deviceIdentifier': payload.dev
    };

    sendC2d(payload.ap, payload.dev, action, "characteristics");

    res.send({payload: action, props: properties});
})

app.post('/southbound/authenticate', function (req, res) {
    const payload = JSON.parse(req.body.body);

    let action = {
        "actionType": "bleAuthenticate",
        "method": payload.method,
        "bonding": payload.bonding,
        "passkey": payload.passkey,
        "keyOwn": payload.keyown,
        "keyOob": payload.keyoob,
        "timeout": 30
    };

    let properties = {
        'messageId': '12345678',
        'contentType': 'application/json',
        'messageType': 'bleActions',
        'deviceIdentifier': payload.dev
    };

    sendC2d(payload.ap, payload.dev, action, "bleActions");

    res.send({payload: action, props: properties});
})

app.post('/southbound/encrypt', function (req, res) {
    const payload = JSON.parse(req.body.body);

    let action = {
        "actionType": "bleEncrypt",
        "bondingKey": payload.bondingkey,
        "timeout": 30
    };

    let properties = {
        'messageId': '12345678',
        'contentType': 'application/json',
        'messageType': 'bleActions',
        'deviceIdentifier': payload.dev
    };

    sendC2d(payload.ap, payload.dev, action, "bleActions");

    res.send({payload: action, props: properties});
})

app.get('/tabledata/:type', (req, res, next) => pgHandler.getAllData(req, res).catch(next))
app.post('/bledata', (req, res, next) => pgHandler.getBleDataAp(req, res).catch(next))
app.get('/chartdates', (req, res, next) => pgHandler.getChartDates(req, res).catch(next))
app.post('/chartaps', (req, res, next) => pgHandler.getChartAps(req, res).catch(next))
app.get('/dates', (req, res, next) => pgHandler.getDates(req, res).catch(next))
app.get('/approfile', (req, res, next) => pgHandler.getApProfile(req, res).catch(next))
app.get('/radioprofile', (req, res, next) => pgHandler.getRadioProfile(req, res).catch(next))
app.get('/usbprofile', (req, res, next) => pgHandler.getUsbProfile(req, res).catch(next))
app.post('/chart', (req, res, next) => pgHandler.getChartData(req, res).catch(next))
app.post('/tsdata', (req, res, next) => pgHandler.getTableData(req, res).catch(next))
app.post('/avgrssi', (req, res, next) => pgHandler.getAvgRssi(req, res).catch(next))
app.post('/avgrssible', (req, res, next) => pgHandler.getAvgRssiBle(req, res).catch(next))


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found')
    err.status = 404
    next(err)
})

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
})

module.exports = {
    app,
    pgPool
}