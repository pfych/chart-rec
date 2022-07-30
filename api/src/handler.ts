import * as AWS from 'aws-sdk';
import { APIGatewayEvent } from 'aws-lambda';
import express from 'express';
import serverless from 'serverless-http';


AWS.config.update({ region: 'ap-southeast-2' })



const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

module.exports.handler = serverless(app, {
  request(request, event: APIGatewayEvent, context) {
    request.context = event.requestContext;
  },
});

app.post('/ping', async (req, res) => {
  console.log("Ping", req)
  res.json({message: "pong"})
})

