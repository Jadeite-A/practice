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
            console.log(res, 'ssssssss');
            result.data = {
              ...res.data,
              name, author
            };
            result.date = res.date;
          }
        ).catch(
          (error) => {
            console.log(error, '////////////');
            result.message = error;
            result.status = 'FAILURE';
            result.date = new Date().toLocaleString();
            result.data = {
              name, author
            }
          }
        ).finally(() => {
          res.send(result);
        });
      })
  }
}
module.exports = user;