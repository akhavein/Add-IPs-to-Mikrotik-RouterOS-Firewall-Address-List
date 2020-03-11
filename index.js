const csv=require('csvtojson');
const iranIPsCsvFilePath='./IranIPs.csv';
const myCIDRSCsvFilePath='./myCIDRs.csv';
const Netmask = require('netmask').Netmask;
const fs = require('fs');

const manualIPs = [
  '176.31.23.179', // mrmovie
  '78.46.190.27', // mrmovie
  '',
]

const ips = manualIPs;

const validateIPAddress = (ip) => {
  var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if(ip.match(ipformat)) {
    return true;
  }
  return false;
}

const ipBatchLength = (batch) => {
  let out = 0;
  batch.forEach((ip) => {
    out += ip.length;
  });
  return out;
}

(async () => {
  const iranCIDRsjsonObj = await csv({
    noheader:true,
    output: "csv"
  })
  .fromFile(iranIPsCsvFilePath);
  const myCIDRsjsonObj = await csv().fromFile(myCIDRSCsvFilePath);
  const iranCIDRs = iranCIDRsjsonObj.map((item) => item[0]);
  const myCIDRs = myCIDRsjsonObj.map((item) => item.ip);
  const cidrs = [...myCIDRs, ...iranCIDRs];
  cidrs.forEach((cidr) => {
    const block = new Netmask(cidr);
    block.forEach((ip, long, index) => {
      ips.push(ip);
    });
  })
  const noDuplicateIPs = [];
  ips.filter(validateIPAddress).forEach((ip) => {
    let flag = true;
    noDuplicateIPs.forEach((ndip) => {
      if (ip === ndip) {
        flag = false;
      }
    });
    if (flag) {
      noDuplicateIPs.push(ip);
    }
  })
  try {
    fs.writeFile(`./IPs/AllIPs.txt`, noDuplicateIPs.join('/n'), (err) => {
      if (err) {
        return console.log(err);
      }
      console.log(`The file ./IPs/AllIPs.txt was saved!`);
    });
  } catch (err) {
    console.error(err);
  }
  const ipBatches = [];
  let iterator = 0;
  ipBatches[iterator] = [];
  noDuplicateIPs.forEach((ip) => {
    ipBatches[iterator].push(ip);
    if (ipBatchLength(ipBatches[iterator]) > 3500) {
      iterator += 1;
      ipBatches[iterator] = [];
    }
  });
  
  ipBatchesString = ipBatches.map((batch) => batch.join('\n')).map((item) => item.concat('\n#'));
  ipBatchesString.forEach((batchString, index) => {
    try {
      fs.writeFile(`./IPs/IPs${index}.txt`, batchString, (err) => {
        if (err) {
          return console.log(err);
        }
        console.log(`The file ./IPs/IPs${index}.txt was saved!`);
      });
    } catch (err) {
      console.error(err);
    }
  })
})();