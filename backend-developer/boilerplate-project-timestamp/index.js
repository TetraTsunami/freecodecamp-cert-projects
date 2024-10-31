// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip} (${req.headers.origin || "*"})`);
  next();
}
app.use(logger);

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/:date?", function(req, res) {
  const date = (req.params.date == undefined) ? new Date() : 
        isNaN(req.params.date) ? new Date(req.params.date) :
        new Date(parseInt(req.params.date));
  
  if (isNaN(date)) {
    console.log(`${req.params.date} =>\n${JSON.stringify({ error: "Invalid Date" })}`)
    return res.json({ error: "Invalid Date" })
  }
  
  const ret = {
    unix: date.valueOf(),
    utc: date.toUTCString()
  }
  console.log(`${req.params.date} =>\n${date}\n${JSON.stringify(ret, null, 2)}\n`)
  res.json(ret);
});



// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
