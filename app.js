const { Dataset } = require('data.js')
var fs = require("fs");


const path = 'https://datahub.io/core/covid-19/datapackage.json'

  // We're using self-invoking function here as we want to use async-await syntax:
  ; (async () => {
    const dataset = await Dataset.load(path)
    // get list of all resources:
    for (const id in dataset.resources) {
      console.log(dataset.resources[id]._descriptor.name)
    }
    // get all tabular data(if exists any)
    for (const id in dataset.resources) {
      if (dataset.resources[id]._descriptor.format === "csv" & dataset.resources[id]._descriptor.name === "countries-aggregated") {
        const file = dataset.resources[id]
        // Get a raw stream
        const stream = await file.stream()
        // entire file as a buffer (be careful with large files!)
        const buffer = await file.buffer
        // print data
        //stream.pipe(process.stdout)

        fs.writeFile('out.csv', buffer, function (err) {
          if (err) {
            return console.error(err);
          }
          console.log("Data written successfully!");

        });

        
      }
    }
  })()