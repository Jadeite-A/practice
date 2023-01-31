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
      .on('end', () => {
        const { name, author, path } = JSON.parse(postData);
        // let result = 'SUCCESS';
        // let data = '';
        let result = {
          code: 200,
          data: '',
          status: 'SUCCESS',
        }
        downloadm(name, author, path).then(
          res => {
            result.data = res.data;
            result.date = res.date;
          }
        ).catch(
          (error) => {
            console.log('????????????????????????');
            result.message = error;
            result.status = 'FAILURE'
          }
        ).finally(() => {
          res.send(result);
        });
      })
  }
}
module.exports = user;