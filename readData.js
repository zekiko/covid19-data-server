var fs = require("fs");

const https = require("https");


const path = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/05-15-2020.csv"

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

const getAllPathsUntilToday = () => {
    const skeletonPath = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/"
    const paths = []

    //console.log(skeletonPath)
    for (let i = 0; i < allDates.length; i++) {
        paths.push(skeletonPath.concat(allDates[i] + ".csv"))
    }

    return paths;
}

const allPaths = getAllPathsUntilToday()
//console.log(allPaths[114])

function readData() {

    for (let i = 0; i < allPaths.length; i++) {

        https.get(allPaths[i], function (res) {
            console.log("Got response: " + res.statusCode);

            var content = '';
            res.on('data', function (chunk) {
                //console.log('chunk ' + chunk.length);
                content += chunk;

            });
            res.on('end', function () {
                console.log('end');
                //console.log(content.length);
                //console.log(content);
                /* var file = fs.createWriteStream("./data2/" + allDates[i] + ".csv");
                file.write(content) */

                

                fs.stat("./data2/" + allDates[i] + ".csv", function (err, stat) {
                    var csvFileContent;
                    if (err == null) {
                        console.log('File exists');
                    }
                    else {
                        console.log('New file, writing...');
                        
                        fs.writeFile("./data2/" + allDates[i] + ".csv", content, function (err) {
                            if (err) throw err;
                            console.log('file saved');
                        });
                    }
                });
                    //fs.close(file) //mı?
                });
            }).on('error', function (e) {
                console.log("Got error: " + e.message);
            });

        }
}

    readData()


