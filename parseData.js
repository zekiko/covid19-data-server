var fs = require("fs");

const csv = require('csv-parser');
const { Parser } = require('json2csv');

var json2csv = require('json2csv');


const getDaysInMonth = function (month, year) {
    // Here January is 1 based
    //Day 0 is the last day in the previous month
    return new Date(year, month, 0).getDate();
    // Here January is 0 based
    // return new Date(year, month+1, 0).getDate();
};

const getAllDatesUntilToday = () => {
    var result = [] //month-day-year
    var daysInMonths = []
    const utcDate = new Date(Date.now());

    for (let i = 1; i <= utcDate.getMonth() + 1; i++) {
        //console.log(getDaysInMonth(i, utcDate.getFullYear()))
        daysInMonths.push(getDaysInMonth(i, utcDate.getFullYear()))
    }

    for (let i = 0; i <= utcDate.getMonth(); i++) {

        var d = new Date();
        d.setMonth(i);

        for (let j = 1; j <= daysInMonths[i]; j++) {
            d.setDate(j)

            if (i === utcDate.getMonth() & d.getDate() === utcDate.getDate()) {
                break;
            }

            if (i === 0 & d.getDate() <= 21) {
                continue;
            }

            resultDateStr = (("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) + "-" + utcDate.getFullYear())
            result.push(resultDateStr)
            //console.log(resultDateStr)
        }
    }

    return result;

}

const allDates = getAllDatesUntilToday();
//console.log(allDates, allDates.length)

const transformFields = (arr) => {
    for (i in arr) {
        var inthKeys = Object.keys(arr[i])
        for (j of inthKeys) {
            if (j === "Country/Region") {
                Object.defineProperty(arr[i], "Country_Region", Object.getOwnPropertyDescriptor(arr[i], j));
                delete arr[i][j];
            } else if (j === "﻿Province/State") {
                Object.defineProperty(arr[i], "Province_State", Object.getOwnPropertyDescriptor(arr[i], j));
                delete arr[i][j];
            } else if (j === "Last Update") {
                Object.defineProperty(arr[i], "Last_Update", Object.getOwnPropertyDescriptor(arr[i], j));
                delete arr[i][j];
            }
        }
    }
    arr.map(item => {
        var itemKeys = Object.keys(item)
        itemKeys.map(i => {
            if(item[i] === ""){
                item[i] = "0"
            }
        })
    })

    return arr;
}

const processData = (res) => {
    res = transformFields(res)
    //console.log(res)

    var countryNames = []
    var uniqueCountryNames = []
    var countries = []

    for (i of res) {
        countryNames.push(i['Country_Region'])
    }

    uniqueCountryNames = [...new Set(countryNames)];
    //console.log(uniqueCountryNames)

    for (i of uniqueCountryNames) {
        var x = []
        for (j of res) {
            //console.log("j: ", j['Country/Region'])
            if (i === j.Country_Region & i === "Mainland China") {
                x.push(j)
            }
        }
        //console.log("x: ", x)
        console.log(x.map(i => i.Confirmed))
        if (x.length > 0) {
            let totalConfirmed = x.reduce((acc, cur) => ({ Confirmed: parseInt(acc.Confirmed, 10) + parseInt(cur.Confirmed, 10) }));
            x[x.length - 1].Confirmed = totalConfirmed.Confirmed;

            let totalDeaths = x.reduce((acc, cur) => ({ Deaths: parseInt(acc.Deaths, 10) + parseInt(cur.Deaths, 10) }));
            x[x.length - 1].Deaths = totalDeaths.Deaths

            let totalRecovered = x.reduce((acc, cur) => ({ Recovered: parseInt(acc.Recovered, 10) + parseInt(cur.Recovered, 10) }));
            x[x.length - 1].Recovered = totalRecovered.Recovered

            let totalActive = x.reduce((acc, cur) => ({ Active: parseInt(acc.Active, 10) + parseInt(cur.Active, 10) }));
            x[x.length - 1].Active = totalActive.Active

            countries.push(x[x.length - 1])

            //console.log("bu: ", x, "********", countries)

        }

    }

    //console.log(countries)

    /* const json2csvParser = new Parser();
    const csv = json2csvParser.parse(countries, {header: false});
    //console.log(csv);
    fs.appendFileSync('countriesAppended.csv', '\n' + csv); */



    /* var newLine = "\r\n";

    fs.stat('countriesAppended.csv', function (err, stat) {
        var csvFileContent;
        if (err == null) {
            console.log('File exists');

            //write the actual data and end with newline
            csvFileContent = json2csv.parse(countries, { header: false }) + newLine;

            fs.appendFile('countriesAppended.csv', csvFileContent, function (err) {
                if (err) throw err;
                console.log('The "data to append" was appended to file!');
            });
        }
        else {
            //write the headers and newline
            console.log('New file, writing with headers');
            csvFileContent = json2csv.parse(countries, { header: true }) + newLine;

            fs.writeFile('countriesAppended.csv', csvFileContent, function (err) {
                if (err) throw err;
                console.log('file saved');
            });
        }
    }); */



    ////////////////////

    var newLine = "\r\n";

    fs.stat('countriesAppended.csv', function (err, stat) {
        var csvFileContent;
        if (err == null) {
            console.log('File exists');

            //write the actual data and end with newline
            csvFileContent = json2csv.parse(countries, { header: false }) + newLine;

            fs.appendFileSync('countriesAppended.csv', csvFileContent, function (err) {
                if (err) throw err;
                console.log('The "data to append" was appended to file!');
            });
        }
        else {
            //write the headers and newline
            console.log('New file, writing with headers');
            csvFileContent = json2csv.parse(countries, { header: true }) + newLine;

            fs.writeFileSync('countriesAppended.csv', csvFileContent, function (err) {
                if (err) throw err;
                console.log('file saved');
            });
        }
    });


}

const parseDataToJson = () => {
    let results = [];

    for (let i = allDates.length - 1; i > allDates.length - 3; i--) {
        console.log("i: ", i, allDates[i])
        fs.createReadStream('./data2/' + allDates[allDates.length - 1] + ".csv")
            .pipe(csv())
            .on('data', (row) => {
                results.push(row)
                //console.log(row);
            })
            .on('end', () => {
                //console.log('CSV file successfully processed');

                processData(results)
            });
    }
}

//parseDataToJson()


(async () => {
    const gop = (i) => {
        return new Promise(resolve => {


            let results = [];

            //fs.createReadStream('./data2/' + allDates[i] + ".csv")
            fs.createReadStream('./data2/03-21-2020.csv')
                .pipe(csv())
                .on('data', (row) => {
                    results.push(row)
                    //console.log(row);
                })
                .on('end', () => {
                    console.log('CSV file successfully read');
                    //console.log(results.length)
                    resolve(results)
                    processData(results)
                });

        });

    }

    for (let i = 0; i < 1; i++) {
        const ko = await gop(i)
    }
    //console.log(ko)
})();


