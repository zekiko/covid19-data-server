var fs = require("fs");

const csv = require('csv-parser');
const { Parser } = require('json2csv');

var json2csv = require('json2csv');

const myCars = [
  {
    "carLol": "Audi",
    "priceLol": 40000,
    "color": "blue"
  }, {
    "car": "BMW",
    "price": 35000,
    "color": "black"
  }, {
    "car": "Porsche",
    "price": 60000,
    "color": "green"
  }
];

const kamon = "price"

const fields = [{
  label: 'Car Name',
  value: 'carLol'
}, {
  label: 'Price USD',
  value: 'priceLol'
},
];

const json2csvParser = new Parser();
const c = json2csvParser.parse(myCars);


var keyler = []

for (i in myCars) {
  var ar = Object.keys(myCars[i])
  for (j of ar) {
    keyler.push(j)
  }
  //console.log("myCars[i]: ",  keyler) 
}

const uKeyler = [...new Set(keyler)];
//console.log(uKeyler)

for (i in myCars) {

  var inthKeys = Object.keys(myCars[i])
  for (j of inthKeys) {
    if (j === "priceLol") {
      Object.defineProperty(myCars[i], "newprice", Object.getOwnPropertyDescriptor(myCars[i], j));
      delete myCars[i][j];
    } else if (j === "carLol") {
      Object.defineProperty(myCars[i], "newcar", Object.getOwnPropertyDescriptor(myCars[i], j));
      delete myCars[i][j];
    }
  }

}


const utcDate = new Date(Date.now());


resultDateStr = (("0" + (utcDate.getMonth() + 1)).slice(-2) + "-" + ("0" + utcDate.getDate()).slice(-2) + "-" + utcDate.getFullYear())
console.log(resultDateStr)