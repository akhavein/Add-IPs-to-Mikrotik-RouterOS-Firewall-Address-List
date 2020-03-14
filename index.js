const csv=require('csvtojson');
const iranCIDRsICTCsvFilePath='./IranCIDRsICT.csv';
const iranOfficialCIDRsCsvFilePath='./IranOfficialCIDRs.csv';
const myCIDRSCsvFilePath='./myCIDRs.csv';
const cidrTools = require('cidr-tools');
const fs = require('fs');

const batchLength = (batch) => {
  let out = 0;
  batch.forEach((ip) => {
    out += ip.length;
  });
  return out;
}

(async () => {
  const iranCIDRsICTjsonObj = await csv({
    noheader:true,
    output: "csv"
  })
  .fromFile(iranCIDRsICTCsvFilePath);
  const iranOfficialCIDRsjsonObj = await csv({
    noheader:true,
    output: "csv"
  })
  .fromFile(iranOfficialCIDRsCsvFilePath);
  const myCIDRsjsonObj = await csv().fromFile(myCIDRSCsvFilePath);
  const iranCIDRsICT = iranCIDRsICTjsonObj.map((item) => item[0]);
  const iranOfficialCIDRs = iranOfficialCIDRsjsonObj.map((item) => item[0]);
  const myCIDRs = myCIDRsjsonObj.map((item) => item.ip);
  const cidrs = [...myCIDRs, ...iranCIDRsICT, ...iranOfficialCIDRs];
  mergedCIDRs = cidrTools.merge(cidrs);
  try {
    fs.writeFile(`./CIDRs/AllCIDRs.txt`, mergedCIDRs.join('\n'), (err) => {
      if (err) {
        return console.log(err);
      }
      console.log(`The file ./CIDRs/AllCIDRs.txt was saved!`);
    });
  } catch (err) {
    console.error(err);
  }
  const cidrBatches = [];
  let iterator = 0;
  cidrBatches[iterator] = [];
  mergedCIDRs.forEach((ip) => {
    cidrBatches[iterator].push(ip);
    if (batchLength(cidrBatches[iterator]) > 3500) {
      iterator += 1;
      cidrBatches[iterator] = [];
    }
  });
  
  cidrBatchesString = cidrBatches.map((batch) => batch.join('\n')).map((item) => item.concat('\n#'));
  cidrBatchesString.forEach((batchString, index) => {
    try {
      fs.writeFile(`./CIDRs/CIDRs${index}.txt`, batchString, (err) => {
        if (err) {
          return console.log(err);
        }
        console.log(`The file ./CIDRs/CIDRs${index}.txt was saved!`);
      });
    } catch (err) {
      console.error(err);
    }
  })
})();