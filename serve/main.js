const express = require('express');
const userRouter = require('./router/user');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
// app.use(express.static());
// app.get('/api/list', (err, res) => {
//   res.send({
//     code: 200,
//     data: [{ name: 1 }, { name: 2 }]
//   })
// })

app.use('/api',userRouter);

app.listen(9588, () => {
  console.log('Succeed!');
});
//192.168.0.108