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

// spin server
app.listen(port, function (err) {
  if (err) console.log("Error spinning server")
  console.log("Listening on Port", port);
});

