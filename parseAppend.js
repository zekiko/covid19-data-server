var fs = require("fs");

const csv = require('csv-parser');
const { Parser } = require('json2csv');

var json2csv = require('json2csv');

const utcDate = new Date(Date.now());
//const statsDate = utcDate.getFullYear() + "-" + ("0" + (utcDate.getMonth() + 1)).slice(-2) + "-" + ("0" + (utcDate.getDate() - 1)).slice(-2)


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
//console.log("allDates[allDates.length-1]: ", allDates[allDates.length - 1])

const transformFields = (arr, date) => {
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
    for (i in arr) {
        var newObject = {
            'Date': date,
            'Country': arr[i].Country_Region,
            'Confirmed': arr[i].Confirmed,
            'Recovered': arr[i].Recovered,
            'Deaths': arr[i].Deaths,
            'Last_Update': arr[i].Last_Update,
        };
        arr[i] = newObject
    }

    //console.log("arr: ", arr[0].Last_Update)
    return arr;
}


const processData = (res, i) => {
    console.log("Processing data...")
    var splittedDate = allDates[allDates.length - i].split("-")
    const date = splittedDate[2] + "-" + splittedDate[0] + "-" + splittedDate[1]


    res = transformFields(res, date)
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

        }

    }

    ////////////////////
    var newLine = "\r\n";

    fs.stat('countries.csv', function (err, stat) {
        var csvFileContent;
        if (err == null) {
            console.log('File exists... Appending data for ' + date);

            //write the actual data and end with newline
            csvFileContent = json2csv.parse(countries, { header: false }) + newLine;

            fs.appendFileSync('countries.csv', csvFileContent, function (err) {
                if (err) throw err;
                console.log('The "data to append" was appended to file!');
            });
            
        }
        else {
            //write the headers and newline
            console.log('New file, writing with headers');
            csvFileContent = json2csv.parse(countries, { header: true }) + newLine;

            fs.writeFileSync('countries.csv', csvFileContent, function (err) {
                if (err) throw err;
                console.log('file saved');
            });

        }
    });



}


const getDaysCountNotUpdated = (arr) => {

    let lastUpdatedDataDateSplitted = arr[arr.length - 1].Date.split("-")
    let lastUpdatedDay = parseInt(lastUpdatedDataDateSplitted[lastUpdatedDataDateSplitted.length - 1])
    //let result = utcDate.getDate() - lastUpdatedDataDay - 1

    if (utcDate.getDate() === lastUpdatedDay) {
        if (utcDate.getMonth() + 1 === parseInt(lastUpdatedDataDateSplitted[1])) {//same month
            return 1;
        }
        result = (utcDate.getDate() + (getDaysInMonth(parseInt(lastUpdatedDataDateSplitted[1]), 2020) - parseInt(lastUpdatedDataDateSplitted[2]))) - 1
    } else {
        result = (utcDate.getDate() - lastUpdatedDay) - 1
    }

    return result;
}


(async () => {


    const checkParsedData = () => {
        return new Promise(resolve => {


            let countries_to_append = [];

            //fs.createReadStream('./data2/' + allDates[i] + ".csv")
            rs = fs.createReadStream('./countries.csv')
            rs.pipe(csv())
                .on('data', (row) => {
                    countries_to_append.push(row)
                    //console.log(row);
                })
                .on('end', () => {
                    console.log('File successfully read: countries.csv');
                    //console.log(countries_to_append.length)
                    let count = getDaysCountNotUpdated(countries_to_append)
                    resolve(count)

                });
            rs.on('error', function (error) { console.log("Dosya bulunamadı: ", error) });
        })
    }

    const readData = (i) => {
        return new Promise(resolve => {

            let results = [];

            //console.log("Gİrdi: ", i)

            rs = fs.createReadStream('./data2/' + allDates[allDates.length - i] + '.csv')
            rs.pipe(csv())
                .on('data', (row) => {
                    results.push(row)
                    //console.log(row);
                })
                .on('end', () => {
                    console.log( 'File successfully read: ' + allDates[allDates.length - i] + '.csv');

                    resolve(results)
                    //processData(results)
                });
            rs.on('error', function (error) { console.log("Dosya bulunamadı: ", error) });
        })
    }

    const daysCountNotUpdated = await checkParsedData()
    //console.log("up: ", up)
    
    if(daysCountNotUpdated === 0){
        console.log("DATA IS UP TO DATE.")
    }

    for (let i = daysCountNotUpdated; i > 0; i--) {
        const dataToProcess = await readData(i)
        //console.log(dataToProcess.length)
        processData(dataToProcess, i)
    }
    
})();


