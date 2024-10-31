var express = require('express');
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
var cors = require('cors');
require('dotenv').config()

var app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip} (${req.headers.origin || "*"})`);
  next();
}
app.use(logger);

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post("/api/fileanalyse", upload.single("upfile"), (req, res, next) => {
  res.json({
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size,
  })
})


const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Your app is listening on port ' + port)
});
