const config = require('./config')
const express = require('express')
const path = require('path')
const cors = require('cors')
const logger = require('morgan')
const { Pool } = require('pg')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const postgresDbHandler = require("./routes/postgresDbHandler");

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

    const queryTsdatahypertable = `CREATE TABLE IF NOT EXISTS tsdatahypertable (time TIMESTAMPTZ NOT NULL, device TEXT NOT NULL, rssi SMALLINT NOT NULL, ble_data TEXT NOT NULL, frame_type TEXT NOT NULL, mac_addr_type TEXT NOT NULL, ap TEXT NOT NULL);`;
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

app.use(cors())
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function (req, res, next) {
    res.render('Welcome to backend', {title: 'Express'});
});

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