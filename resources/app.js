  const express = require('express')
  const app = express()

  var cors = require('cors')

  var pg = require('pg')
  var pg_format = require('pg-format')
  var http = require('http');

  var mysql = require('mysql')

  var PGUSER = 'postgres'
  var PGDATABASE = 'mantis'
  var PGHOST = '192.168.0.6'
  var PGPASS = 'murah'
  
  var MYUSER = 'root'
  var MYDATABASE = 'glpi'
  var MYHOST = '192.168.0.6'
  var MYPASS = 'murah'

  var config = {
    user: PGUSER, // name of the user account
    database: PGDATABASE, // name of the database
    host: PGHOST,
    password: PGPASS,
//    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
  }

  var myConfig = {
	  host: MYHOST,
	  user: MYUSER,
	  password: MYPASS,
	  database: MYDATABASE
 }
//var pool = new pg.Client(config)
//var whitelist = ['http://caixa.murah.info.tm:10201','http://caixa.murah.info.tm:10202/','http://localhost']
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
//  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response 
 // }else{
   // corsOptions = { origin: false } // disable CORS for this request 
 // }
  callback(null, corsOptions) // callback expects two parameters: error and options 
}
 
  //create a server object:
  app.get('/mantis', cors(corsOptionsDelegate), function (req, res) {
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

  app.get('/glpi', cors(corsOptionsDelegate), function (req, res) {
    var myClient;
    var retorno = {}
    var con = mysql.createConnection(myConfig);
    con.connect(function (err) {
      if (err) console.log(err)

      var query = "select t.nomeentidade as name, sum(case when t.datavencimento < now() then 1 else 0 end) vencido,  sum(case when t.datavencimento between now() and date_add(now(), interval 5 day) then 1 else 0 end) vincendo, sum(case when t.datavencimento > date_add(now(), interval 5 day) or t.datavencimento is null then 1 else 0 end) avencer  from glpi.dashboardtickets t where";

      if(req.query.pendente != 'true')
         query += " t.status <> 4 and ";

      if(req.query.solucionado != 'true')
         query += " t.status <> 5 and ";

      if(req.query.processando == 'false')
         query += " t.status not in (1,2,3) and ";

      if(req.query.incidente == 'false')
         query += " t.type <> 1 and ";

      if(req.query.grupo)
         query += " t.grupoatribuido like '%" + req.query.grupo + "%' and ";

      if(req.query.requisicao == 'false')
         query += " t.type <> 2 and ";
      
      query += " t.status <> 6 group by t.nomeentidade order by t.nomeentidade"; 

      var lbs = ["Cliente","Vencido", "Vincendo","A Vencer"];

console.log(query);
       con.query(query, function (err, result, fields) {
        if (err) {
          console.log(err)
        }
console.log(result);
        var retorno = {labels:[],data:[],time:''};
        retorno.labels = lbs;

        for (var i = 0; i < result.length; i++) {
          var v = result[i];
          retorno.data.push(v);
        };
        retorno.time = new Date();
        con.end();
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify(retorno));
        res.end();
      });
    });
  });

  app.get('/glpi/tickets', cors(corsOptionsDelegate), function (req, res) {
    var myClient;
    var retorno = {}
    var con = mysql.createConnection(myConfig);
    con.connect(function (err) {
      if (err) console.log(err)

      var query = "SELECT numero as Numero,titulo as Titulo,typelabel as Tipo,datacriacao as Criacao,datavencimento as Vencimento ,nomeentidade as Cliente,status_name as Status,locations_name as Localizacao,grupoatribuido as Grupo,attr_user as Atribuido FROM glpi.dashboardtickets as t where "; 
      
      if(req.query.pendente != 'true')
         query += " t.status <> 4 and ";

      if(req.query.solucionado != 'true')
         query += " t.status <> 5 and ";

      if(req.query.processando == 'false')
         query += " t.status not in (1,2,3) and ";

      if(req.query.incidente == 'false')
         query += " t.type <> 1 and ";

      if(req.query.requisicao == 'false')
         query += " t.type <> 2 and ";

      if(req.query.grupo)
         query += " t.grupoatribuido like '%" + req.query.grupo + "%' and ";

      if(req.query.nomeentidade)
          query += " nomeentidade like '" + req.query.nomeentidade + "' and ";

      query += " 1 = 1 order by numero ";
      
      var lbs = ["Numero","Titulo","Tipo", 
      "Criacao", "Vencimento","Cliente","Status","Localizacao","Grupo", "Atribuido"];

       con.query(query, function (err, result, fields) {
        if (err) {
          console.log(err)
        }

        var retorno = {labels:[],data:[],time:''};
        retorno.labels = lbs;

        for (var i = 0; i < result.length; i++) {
          var v = result[i];
          retorno.data.push(v);
        };
        retorno.time = new Date();
        con.end();
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify(retorno));
        res.end();
      });
    });
  });

 app.get('/glpi/groups', cors(corsOptionsDelegate), function (req, res) {
    var myClient;
    var retorno = {}
    var con = mysql.createConnection(myConfig);
    con.connect(function (err) {
      if (err) console.log(err)

      var query = "select id,name from glpi_groups where entities_id = 26 order by name";

      var lbs = ["Id","Nome"];

       con.query(query, function (err, result, fields) {
        if (err) {
          console.log(err)
        }
        var retorno = {labels:[],data:[],time:''};
        retorno.labels = lbs;

        for (var i = 0; i < result.length; i++) {
          var v = result[i];
          retorno.data.push(v);
        };
        retorno.time = new Date();
        con.end();
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify(retorno));
        res.end();
      });
    });
  });

  app.listen(10201); //the server object listens on port 8080

  
