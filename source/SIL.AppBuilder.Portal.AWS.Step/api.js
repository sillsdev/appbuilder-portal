require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('node:fs');

const { 
  SFNClient, 
  CreateStateMachineCommand,
  DescribeStateMachineCommand,
  ListStateMachinesCommand,
  StartExecutionCommand,
  SendTaskSuccessCommand
} = require("@aws-sdk/client-sfn"); // CommonJS import

const client = new SFNClient({
  endpoint: `https://states.${process.env.AWS_DEFAULT_REGION}.amazonaws.com`,
  region: process.env.AWS_DEFAULT_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const machine = 'Scriptoria-v2-Test-02';

const jobs = [];

const machineARN = `arn:aws:states:${process.env.AWS_DEFAULT_REGION}:${process.env.AWS_ACCOUNT_ID}:stateMachine:${machine}`;

const app = express();

const port = 3000;

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World, from express');
});

app.post('/echo', (req, res) => {
  console.log(req.body);
  res.send(req.body);
});

app.get('/machine', async (req, res) => {
  res.send(await client.send(new DescribeStateMachineCommand({stateMachineArn: machineARN})));
});

app.get('/flow/start', async (req, res) => {
  res.send(await client.send(new StartExecutionCommand({stateMachineArn: machineARN})));
});

app.post('/token', (req, res) => {
  console.log(req.body);

  jobs.push(req.body);

  res.status(200).send("token received");
});

app.get('/count', (req, res) => {
  res.send({count: jobs.length});
})

app.get('/execute', async (req, res) => {
  try {
    if (jobs.length) {
      const job = jobs.shift();

      const stat = await client.send(new SendTaskSuccessCommand({
        taskToken: job.token,
        output: JSON.stringify(job.data)
      }));

      console.log(stat);
      res.send(stat);
    }
  } catch(e) {
    console.log(e);
    res.send(e);
  }
})

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`));
