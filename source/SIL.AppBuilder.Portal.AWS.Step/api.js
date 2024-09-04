const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const { SFNClient, ListStateMachinesCommand } = require("@aws-sdk/client-sfn"); // CommonJS import

const client = new SFNClient({
  endpoint: `http://localhost:8083`,
  region: 'dummy',
  credentials: {
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy'
  }
});

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

app.get('/machines', async (req, res) => {
  try {
    const response = await client.send(new ListStateMachinesCommand());
    res.send(response);
  }
  catch (e) {
    console.log(e);
    res.send({error: e});
  }  
})

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`));
