const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.post('/api/reqcontent', (request, response) => {
  const contentresult = request.body;
  console.log('content_result: ', contentresult);
  response.send({
    code: 200,
    data: { id: 1 },
    msg: 'content received',
    content: contentresult.msg
  });
});


app.post('/api/reqInput', (request, response) => {
  const inputresult = request.body;
  console.log('input_result: ', inputresult);
  response.send({
    code: 200,
    data: { id: 2},
    msg: 'input received',
    content: inputresult.msg
  });
});

app.listen(4000, () => {
  console.log(`开启监听模式`);
});
