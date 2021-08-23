const config = require('./config')
const express = require('express')
const path = require('path')
const cors = require('cors')
const logger = require('morgan')
//const pg = require('pg');
const { Pool } = require('pg')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const postgresDbHandler = require("./routes/postgresDbHandler");

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
//const pgClient = new pg.Client(pgConfig)
//pgPool.connect()

const pgHandler = new postgresDbHandler(pgPool)

app.use(cors())
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function (req, res, next) {
    res.render('Welcome to backend', {title: 'Express'});
});

app.post('/addmessage/:type', (req, res, next) => pgHandler.addData(req, res).catch(next))
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