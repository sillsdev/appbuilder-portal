const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('node:fs');

const { 
  SFNClient, 
  CreateStateMachineCommand,
  DescribeStateMachineCommand,
  ListStateMachinesCommand,
  StartExecutionCommand
} = require("@aws-sdk/client-sfn"); // CommonJS import

const client = new SFNClient({
  endpoint: `http://localhost:8083`,
  region: 'dummy',
  credentials: {
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy'
  }
});

const machines = {};

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
});

async function listMachines() {
  try {
    return await client.send(new ListStateMachinesCommand());
  }
  catch (e) {
    console.log(e);
    return {error: e};
  }  
}

app.get('/machines', async (req, res) => {
  res.send(await listMachines());
});

app.get('/machines/:name', async (req, res) => {
  const name = req.params.name;

  if (machines[name]) {
    res.send(await client.send(new DescribeStateMachineCommand({stateMachineArn: machines[name]})));
    return;
  }

  // Sending 404 when not found something is a good practice
  res.status(404).send('State Machine not found');
});

app.get('/flow/start/:name', async (req, res) => {
  const name = req.params.name;

  if (!machines[name]) {
    res.status(404).send('State Machine not found');
    return;
  }

  res.send(await client.send(new StartExecutionCommand({stateMachineArn: machines[name]})));
});

app.post('/token', (req, res) => {
  console.log(req.body);
});

const creation = setInterval(async () => {
  const res = await listMachines();
  if (!res.error) {
    console.log("Creating State Machine");
    fs.readFile("flow.asl.json", (err, data) => {
      client.send(new CreateStateMachineCommand({
        name: "workflow",
        definition: data.toString('utf8'),
        roleArn: "arn:aws:iam::128716708097:role/StepFunctionsLambdaRole"
      })).then((r) => {
        const key = r.stateMachineArn.split(":").pop();
        machines[key] = r.stateMachineArn;
        console.log(machines);
      }).catch((e) => {
        console.log(e);
      })
    });
    clearInterval(creation);
  }
}, 5000);

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`));
