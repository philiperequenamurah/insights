  const express = require('express')
  const app = express()

  var cors = require('cors')

  var http = require('http');

  var mysql = require('mysql')

  
  var MYUSER = 'root'
  var MYDATABASE = 'glpi'
  var MYHOST = '192.168.0.6'
  var MYPASS = 'murah'


  var myConfig = {
	  host: MYHOST,
	  user: MYUSER,
	  password: MYPASS,
	  database: MYDATABASE
 }

var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response 
  callback(null, corsOptions) // callback expects two parameters: error and options 
}
 
  //create a server object:
module.exports = {
  start: function () {
    app.get('/', cors(corsOptionsDelegate), function (req, res) {
      res.setHeader('Content-Type', 'application/json');
      res.write("Central de serviços do GLPI");     
      res.end();   
    });

      app.get('/status', cors(corsOptionsDelegate), function (req, res) {
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

      app.get('/tickets', cors(corsOptionsDelegate), function (req, res) {
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

     app.get('/groups', cors(corsOptionsDelegate), function (req, res) {
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

      app.listen(10203);
    }
}
