  const express = require('express')
  const app = express()

  var cors = require('cors')

  var pg = require('pg')
  var pg_format = require('pg-format')
  var http = require('http');


  var PGUSER = 'postgres'
  var PGDATABASE = 'mantis'
  var PGHOST = '192.168.0.6'
  var PGPASS = 'murah'

  var config = {
    user: PGUSER, // name of the user account
    database: PGDATABASE, // name of the database
    host: PGHOST,
    password: PGPASS,
    idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
  }

var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response 
  callback(null, corsOptions) // callback expects two parameters: error and options 
}
 
module.exports = {
  start: function () {
    app.get('/', cors(corsOptionsDelegate), function (req, res) {
      res.setHeader('Content-Type', 'application/json');
      res.write("Central de serviços do MANTIS");     
      res.end();   
    });
    
    app.get('/status', cors(corsOptionsDelegate), function (req, res) {
      var myClient;  
      var retorno = {}
      new pg.Client(config).connect(function (err, client, done) {
        if (err) console.log(err)
          myClient = client
        
        
        var query = pg_format("select p.name, count(case when severity = 70 then b.id end) AS crash, count(case when severity = 80 then b.id end) AS block,count(case when severity = 60 then b.id end) AS major, count(case when severity not in (60,80,70) then b.id end) AS other from mantis_bug_table b join mantis_project_table p on p.id = b.project_id and p.description like 'AudiXpress Enterprise' where b.status <> 90 group by p.name order by p.name") ; 

        var lbs = ["Cliente","Crash", "Block","Major","Outros"];      

      
         myClient.query(query, function (err, result) {
          if (err) {
            console.log(err)
          }
          var retorno = {labels:[],data:[],time:''};
          retorno.labels = lbs;

          for (var i = 0; i < result.rows.length; i++) {
            var v = result.rows[i];
            retorno.data.push(v);
          };
  	retorno.time = new Date();
  	myClient.end();
          res.setHeader('Content-Type', 'application/json');
          res.write(JSON.stringify(retorno));     
          res.end();   
        });
      });
    });
  }
}

app.listen(10204); //the server object listens on port 8080

