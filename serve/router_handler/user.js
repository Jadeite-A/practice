const queryString = require("queryString");
const { readFile } = require('../operation/readFile');
const { downloadm } = require('../operation/parse');
const user = {
  regUser: (req, res) => {
    let postData = '';
    req.on('data', (postDataChunk) => postData += postDataChunk)
      .on('end', () => {
        const params = JSON.parse(postData);
        res.send({
          code: 200,
          data: readFile(),
          params
        })
      })
  },
  download: (req, res) => {
    let postData = '';
    req.on('data', (postDataChunk) => postData += postDataChunk)
      .on('end', async() => {
        const { name, author } = JSON.parse(postData);
        await downloadm(name, author,'D://');
        res.send({
          code: 200,
          data: ''
        })
      })
  }
}
module.exports = user;