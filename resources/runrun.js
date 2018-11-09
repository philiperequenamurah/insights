  const express = require('express')

  const app = express()

  var cors = require('cors')

  var http = require('http');

  var request = require('request');

// Set the headers
var headers = {
      "App-Key":"b6848dfc62449107867a3c0eda6dac7e",
      "User-Token":"d2b57EWw1EC3hTqVA0aa",
      "Content-Type": "application/json"
}


var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response 
  callback(null, corsOptions) // callback expects two parameters: error and options 
}
 
module.exports = {
  start: function () {
   app.get('/*', cors(corsOptionsDelegate), function (req, res) {
      // Start the request
      var options = {
          url: 'https://runrun.it/api/v1.0' + req._parsedUrl.pathname,
          method: 'GET',
          headers: headers,
          qs: req.query
      };
      console.log('pathname');
      console.log(req._parsedUrl.pathname);
      if(req._parsedUrl.pathname == '' || req._parsedUrl.pathname == null || req._parsedUrl.pathname == '/'){
        res.setHeader('Content-Type', 'application/json');
        res.write("Central de serviços do Runrun");     
        res.end();   
      }else
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
              res.setHeader('Content-Type', 'application/json');
              res.write(JSON.stringify(body));
              res.end();
            }
        });

    });

    app.listen(10202); //the server object listens on port 8080

  }
};
  //create a server object:

  
