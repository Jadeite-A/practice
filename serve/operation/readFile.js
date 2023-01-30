const fs = require("fs");
function readFile(){
  const data = fs.readFileSync('5.txt', "utf-8");
  return data;
}
module.exports = {
  readFile
}