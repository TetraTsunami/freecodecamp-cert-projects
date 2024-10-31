require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const dns = require('node:dns')
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip} (${req.headers.origin || "*"})`);
  next();
}
app.use(logger);
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

let links = []

// Your first API endpoint
app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;
  const host = new URL(url).hostname;
  dns.lookup(host, (err, address, family) => {
    if (err) {
      console.log(err);
      res.json({ error: 'invalid url' });
      return
    };
    links.push(url)
    res.json({
      original_url: url,
      short_url: links.length
    });
  })
});

app.get('/api/shorturl/:url', (req, res) => {
    if (isNaN(req.params.url) || req.params.url > links.length) {
    res.json({ error: 'invalid url' });
    return;
  }
  console.log(req.params.url);
  console.log(links)
  const target = links[parseInt(req.params.url) - 1];
  res.redirect(target);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
