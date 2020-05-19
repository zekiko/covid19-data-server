var fs = require("fs");

const csv = require('csv-parser');
const { Parser } = require('json2csv');

var json2csv = require('json2csv');

const utcDate = new Date(Date.now());
const statsDate = (utcDate.getFullYear() + "-" + ("0" + (utcDate.getMonth() + 1)).slice(-2) + "-" + ("0" + (utcDate.getDate() - 1)).slice(-2) )
console.log(statsDate)

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
console.log(allDates[allDates.length-1])

const transformFields = (arr) => {
    /* for (i in arr) {
        var inthKeys = Object.keys(arr[i])
        for (j of inthKeys) {
            if (j === "Country_Region") {
                Object.defineProperty(arr[i], "MyCountry", Object.getOwnPropertyDescriptor(arr[i], j));
                delete arr[i][j];
            }
            if (j === "FIPS" | j === "Admin2" | j === "Province_State"
                | j === "Lat" | j === "Long_" | j === "Combined_Key" | j === "Active") {
                    delete arr[i][j];
            }
        }
    } */
    for (i in arr){
        var newObject= {
            'Date': statsDate,
            'Country': arr[i].Country_Region,
            'Confirmed': arr[i].Confirmed,
            'Recovered': arr[i].Recovered,
            'Deaths': arr[i].Deaths,
            'Last_Update': arr[i].Last_Update,
        };
        arr[i] = newObject
    }
    
    console.log("arr: ", arr[0].Last_Update)
    return arr;
}

const processData = (res) => {
    res = transformFields(res)
    //console.log(res)

    var countryNames = []
    var uniqueCountryNames = []
    var countries = []

    res.map(item => {
        countryNames.push(item['Country'])
    })

    /* for (i of res) {
        countryNames.push(i['MyCountry'])
    } */

    uniqueCountryNames = [...new Set(countryNames)];
    //console.log(uniqueCountryNames)

    for (i of uniqueCountryNames) {
        var x = []
        for (j of res) {
            //console.log("j: ", j['Country/Region'])
            if (i === j.Country & i === i) {
                x.push(j)
            }
        }
        //console.log("x: ", x)
        if (x.length > 0) {
            //console.log(x.map(i => i.Deaths))

            let totalConfirmed = x.reduce((acc, cur) => ({ Confirmed: parseInt(acc.Confirmed, 10) + parseInt(cur.Confirmed, 10) }));
            x[x.length - 1].Confirmed = totalConfirmed.Confirmed;

            let totalDeaths = x.reduce((acc, cur) => ({ Deaths: parseInt(acc.Deaths, 10) + parseInt(cur.Deaths, 10) }));
            x[x.length - 1].Deaths = totalDeaths.Deaths

            let totalRecovered = x.reduce((acc, cur) => ({ Recovered: parseInt(acc.Recovered, 10) + parseInt(cur.Recovered, 10) }));
            x[x.length - 1].Recovered = totalRecovered.Recovered

            /* let totalActive = x.reduce((acc, cur) => ({ Active: parseInt(acc.Active, 10) + parseInt(cur.Active, 10) }));
            x[x.length - 1].Active = totalActive.Active */

            countries.push(x[x.length - 1])

            //console.log("bu: ", x, "********", countries)

        }

    }

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

(async () => {
    const gop = (i) => {
        return new Promise(resolve => {


            let results = [];

            //fs.createReadStream('./data2/' + allDates[i] + ".csv")
            rs = fs.createReadStream('./data2/' + allDates[allDates.length-1] + '.csv')
                rs.pipe(csv())
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
                rs.on('error', function(error){ console.log("Dosya bulunamadı: ", error) });
            })
        

    }

    for (let i = 0; i < 1; i++) {
        const ko = await gop(i)
    }
    //console.log(ko)
})();


