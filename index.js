const Vonage = require('@vonage/server-sdk');
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/.env.local' });

const express = require('express');
const app = express();
const port = process.env.PORT || 4000

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.removeHeader('x-powered-by');
  //allow access to current method
  res.setHeader('Access-Control-Allow-Methods', req.method);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
})

const nexmo = new Vonage(
  {
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
    applicationId: process.env.APP_ID,
    privateKey: __dirname + '/' + process.env.PRIVATE_KEY_PATH
  },
  { debug: process.env.NODE_ENV !== 'production' },
);


app.post('/getJWT', function (req, res) {
  const jwt = nexmo.generateJwt({
    sub: req.body.name || "kapil",
    acl: {
      paths: {
        '/*/users/**': {},
        '/*/conversations/**': {},
        '/*/sessions/**': {},
        '/*/devices/**': {},
        '/*/image/**': {},
        '/*/media/**': {},
        '/*/applications/**': {},
        '/*/push/**': {},
        '/*/knocking/**': {},
        '/*/legs/**': {},
      },
    },
  });
  res.send({ jwt: jwt });
});

app.get('/getUsers', function (req, res) {
  nexmo.users.get({ ...req.query }, (err, response) => {
    if (err) {
      res.status(401).send({ message: err });
    } else {
      res.send({ users: response?._embedded?.data?.users });
    }
  });
});

app.get('/getConversations', function (req, res) {
  nexmo.conversations.get({}, (err, response) => {
    if (err) {
      console.log(err);
      res.status(500).send({ message: err });
    } else {
      res.send({ conversations: response?._embedded?.data?.conversations });
    }
  })
});

app.post('/createConversation', function (req, res) {
  nexmo.conversations.create(
    {
      name: req.body.name,
      display_name: req.body.display_name || req.body.name,
    },
    (err, response) => {
      if (err) {
        return res.status(400).send(err?.body);

      } else {
        res.send({ id: response });
      }
    },
  );
});

app.post('/createUser', function (req, res) {
  nexmo.users.create(
    {
      name: req.body.name,
      display_name: req.body.display_name || req.body.name,
    },
    (err, response) => {
      if (err) {
        return res.status(400).send(err?.body);
      } else {
        res.send({ id: response.id });
      }
    },
  );
});

// spin server
app.listen(port, function (err) {
  if (err) console.log("Error spinning server")
  console.log("Listening on Port", port);
});

