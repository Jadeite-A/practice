const fs = require("fs");
let request = require("request");
request = request.defaults({ jar: true });
const cheerio = require("cheerio");
const quotedPrintable = require("quoted-printable");
const utf8 = require("utf8");

const headers = {
  accept: "*/*",
  "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
  range: "bytes=0-",
  "sec-ch-ua": '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "audio",
  "sec-fetch-mode": "no-cors",
  "sec-fetch-site": "cross-site",
  // 'Date': 'Mon, 03 Oct 2022 04:03:33 GMT',
  'Content-Type': 'audio/mp4',
};
function downloadMp3(url, pathAndName, callback) {
  console.log(url, pathAndName);
  let req = request({
    url: encodeURI(url),
    method: "get",
    headers,
    timeout: 10000
  });

  req.on("error", (error) => {
    // fs.appendFileSync(errorFilePath, url + "\n");
    // console.log("error---> ", error);

    // const musicInfo = {
    //   filePath: pathAndName,
    //   musicSrc: url,
    // };
    // fs.appendFileSync(errorFilePath, JSON.stringify(musicInfo) + "\n");

    // callback && callback(null, pathAndName);

  });

  req
    .pipe(
      fs.createWriteStream(pathAndName, {
        flags: "w",
        autoClose: true,
      })
    )
    .on("close", () => {
      callback && callback(null, pathAndName);
    })
    .on("complete", (resp, body) => {
      callback && callback(null, pathAndName);
    });
}
function getNameAndAuthor(line) {
  let name = line.slice(line.indexOf(".") + 1, line.lastIndexOf("-")).replace(/\s/g, "");
  let author = line
    .slice(line.indexOf("-") + 1)
    .replace(/\s/g, "")
    .replace(/&/g, "/");
  return [name, author];
}
function getMusicSrc(body) {
  const parser = cheerio.load(body);
  const scripts = [...parser("#player4 ~ script")];
  let script = scripts[scripts.length - 1];
  let src = script?.children?.[0].data?.toString()?.match(/(?<=url\:\s\')(.*)(?=\')/)?.[0] ?? "";
  let musicSrc = src.startsWith("get") ? `https://www.hifini.com/${src}` : src;
  // console.log(333, musicSrc);
  return musicSrc;
}
function encodePrintableCode(str) {
  str = quotedPrintable.encode(utf8.encode(str));
  return `https://www.hifini.com/search-${str
    .replace(/ /g, "_20")
    .replace(/\s/g, "")
    .replace(/==/, "=")
    .replace(/=/g, "_")}-1.htm`;
}
function parseHtmlAndGetData(body, user) {
  const parser = cheerio.load(body);
  const results = [...parser(".media-body .subject  a")]; //  -
  if (!results.length) {
    return null;
  }
  const resultStrArray = results.map((result) => {
    return {
      link: result.attribs.href ?? "",
      hrefName: [...result.children]
        .reduce((prev, cur) => {
          if ("children" in cur) {
            return prev + cur.children[0].data;
          }
          return prev + cur.data;
        }, "")
        .replace(/\./g, ""),
    };
  });
  user = user.toLocaleLowerCase().replace(/\./g, "");
  const targetMusic = resultStrArray.find((item) =>
    item.hrefName.toLocaleLowerCase().includes(user)
  );
  if (targetMusic) {
    return `https://www.hifini.com/${targetMusic.link}`;
  }
  // 选择第一个
  if (resultStrArray.length) {
    return `https://www.hifini.com/${resultStrArray[0].link}`;
  }
  return null;

}
function downloadm(name, author, filePath = 'music') {
  filePath = `${filePath}/${name}-${author}.mp3`;
  const musicUrl = encodePrintableCode(name);
  request({ url: musicUrl }, (error, response, body) => {
    if (error) { 
      console.log(1);
    }
    const url = parseHtmlAndGetData(body, author);
    if (!url) {
      console.log(2);
      return;
    }
    request({ url }, (error, response, body) => {
      if (!body) { };
      const musicSrc = getMusicSrc(body);
      if (!musicSrc) {
        return;
      }
      downloadMp3(musicSrc, filePath, async () => {
        console.log(6669);
      })
      console.log(3);
    });
  })
}

module.exports = {
  downloadm
}