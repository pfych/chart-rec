import { APIGatewayEvent } from 'aws-lambda';
import serverless from 'serverless-http';
import express from 'express';
import * as AWS from 'aws-sdk';
import cors from 'cors';

AWS.config.update({ region: 'ap-southeast-2' });

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
};

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

module.exports.handler = serverless(app, {
  request(request, event: APIGatewayEvent, context) {
    request.context = event.requestContext;
  },
});

app.get('/users', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(JSON.stringify({ key: 'value' }));
});
