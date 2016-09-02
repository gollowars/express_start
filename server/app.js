process.env.SUPPRESS_NO_CONFIG_WARNING = 'y'
let express = require('express')
let morgan = require('morgan')
let cookieParser = require('cookie-parser')
let bodyParser = require("body-parser")
let methodOverride = require('method-override')
let session = require('express-session')
let path = require('path')
// let prismic = require('express-prismic').Prismic
let appConfig = require('config')
let fs = require('fs')
let FileStreamRotator = require('file-stream-rotator')
let app = express()
let logDir = path.join(__dirname,'log')
let errorHandler = require('errorhandler')
let site = require('./site/site') 

// log settings
fs.existsSync(logDir) || fs.mkdirSync(logDir)
let accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: path.join(logDir, 'access-%DATE%.log'),
  frequency: 'daily',
  verbose: false
})


app.set('port',process.env.PORT || appConfig.port)
app.set('views',path.join(__dirname,'views'))
app.set('view engine', 'jade')
app.use(express.static('./public'))
app.use(bodyParser())
app.use(morgan('combined', {stream: accessLogStream}))
app.use(cookieParser('1234'))
app.use(session({secret: '1234', saveUninitialized: true, resave: true}))
app.use(errorHandler());

function handleError(err, req, res) {
  if (err.status == 404) {
    res.status(404).send("Not found");
  } else {  
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
}

app.route('/').get(function(req, res) {
  res.render('index',{
    'title': 'タイトルだよ',
    'headerMessage': 'はろーわーるどだよ！'    
  })
})

var PORT = app.get('port');

app.listen(PORT, function() {
  console.log('Express server listening on http://localhost:' + PORT);
});
