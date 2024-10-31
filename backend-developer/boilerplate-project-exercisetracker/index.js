const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express()
const cors = require('cors')
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });


app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip} (${req.headers.origin || "*"})`);
  next();
}
app.use(logger);

let exerciseSchema = new mongoose.Schema({
  _uid: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: Number,
    required: true
  }
});

let userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  }
});

let Exercise = mongoose.model("Exercise", exerciseSchema);
let User = mongoose.model("User", userSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) => {
  let newUser = new User({ username: req.body.username });
  newUser.save()
    .then(data => {
      delete data.__v
      res.json(data)})
    .catch(err => console.log(err));
});

app.get('/api/users', (req, res) => {
  User.find().select("-__v").exec()
    .then(data => {
      res.json(data)})
    .catch(err => console.log(err));
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  let { description, duration, date } = req.body;
  date = new Date(date);
  if (isNaN(duration)) {
    res.json({error: "Invalid input"})
    return;
  }
  if (isNaN(date)) {
    date = new Date();
  }
  let user = await User.findById(req.params._id).lean()
  delete user.__v
  let newExercise = new Exercise({_uid: user._id, description: description, duration: duration, date: date})
  newExercise.save()
    .then(data => {
      data = data.toObject({versionKey: false});
      data.date = new Date(data.date).toDateString();
      delete data._uid
      res.json({...data, ...user})})
    .catch(err => console.log(err));
});

app.get('/api/users/:_id/logs', async (req, res) => {
  let { from, to, limit } = req.query;
  let filter = {_uid: req.params._id}
  from = new Date(from);
  to = new Date(to);
  if (!isNaN(from) || !isNaN(to)) {
    filter.date = {}
  }
  if (!isNaN(from)) {
      filter["date"]["$gte"] = from.valueOf();
  }
  if (!isNaN(to)) {
    filter["date"]["$lte"] = to.valueOf();
  }
  let query = Exercise.find(filter).select("description duration date -_id").lean();
  if (!isNaN(limit)) {
    query.limit(limit)
  }
  let target = await User.findById(req.params._id).select("username _id").lean()
  query.exec()
    .then(data => {
      data.map(record => {
        let newDate = new Date(record.date);
        record.date = newDate.toDateString();
        return record;
      })
      target["count"] = data.length;
      target["log"] = data;
      res.json(target);
    })
    .catch(err => console.log(err));
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
