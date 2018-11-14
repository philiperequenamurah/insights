  const express = require('express')
  const app = express()
  const mongo = require('./mongo.js')

  var cors = require('cors')

  var http = require('http');

  var mysql = require('mysql')

  var bodyParser = require('body-parser');

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
  corsOptions = { origin: true,  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE","preflightContinue": false } // reflect (enable) the requested origin in the CORS response 
  callback(null, corsOptions) // callback expects two parameters: error and options 
}
 
  //create a server object:
module.exports = {
  start: function (porta) {

    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies  

    app.options("/*", function(req, res, next){
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
      res.send(200);
    });

    app.get('/', cors(corsOptionsDelegate), function (req, res) {
      res.setHeader('Content-Type', 'application/json');
      res.write("Central de serviços do GLPI");     
      res.end();   
    });

      app.get('/status', cors(corsOptionsDelegate), function (req, res) {
        try {
          var myClient;
          var retorno = {}
          var con = mysql.createConnection(myConfig);
          con.connect(function (err) {
            if (err) {
              console.log(err)
              con.end();
              res.sendStatus(500);
              return;
            }


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

             con.query(query, function (err, result, fields) {
              if (err) {
                console.log(err)
                con.end();
                res.sendStatus(500);
                return;
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

        }catch (exception_var) {
          console.log(exception_var);
        }
      });

      app.get('/tickets', cors(corsOptionsDelegate), function (req, res) {
        try{
          var myClient;
          var retorno = {}
          var con = mysql.createConnection(myConfig);
          con.connect(function (err) {
            if (err) {
             console.log(err)
              con.end();
              res.sendStatus(500);
              return;
            }

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
                con.end();
                res.sendStatus(500);
                return;
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
        }catch (exception_var) {
          console.log(exception_var);
        }

      });

      app.get('/tickets/pin', cors(corsOptionsDelegate), function (req, res) {
        try{
          var myClient;
          var retorno = {}
          mongo.listChamado({pin:true},function(resultado){
            var numeros = [];
            var nOrdem = {};
            for (var i = 0; i < resultado.length; i++) {
              if(typeof resultado[i]._id == 'number'){
                numeros.push(resultado[i]._id);
                nOrdem[resultado[i]._id] = (resultado[i]).ordem;
              }
            }
            if(numeros.length <= 0 ){
              res.setHeader('Content-Type', 'application/json');
              res.write(JSON.stringify({}));
              res.end();
              return;
            }

            var con = mysql.createConnection(myConfig);
            con.connect(function (err) {
              if (err) {
                console.log(err)
                con.end();
                res.sendStatus(500);
                return;
              }

              var query = "SELECT numero as Numero,titulo as Titulo,datavencimento as Vencimento ,nomeentidade as Cliente,grupoatribuido as Grupo,attr_user as Atribuido FROM glpi.dashboardtickets as t where "; 
              

              query += " t.numero in ("+numeros.toString()+") and ";

              query += " 1 = 1 order by numero ";
              
              var lbs = ["Numero","Titulo",
               "Vencimento","Cliente","Grupo","Atribuido"];

               con.query(query, function (err, result, fields) {
                if (err) {
                  console.log(err)
                  con.end();
                  res.sendStatus(500);
                  return;
                }

                var retorno = {labels:[],data:[],time:''};
                retorno.labels = lbs;
                for (var i = 0; i < result.length; i++) {
                  var v = result[i];
                  v.ordem = nOrdem[v['Numero']];
                  retorno.data.push(v);
                }
                retorno.time = new Date();
                con.end();
                res.setHeader('Content-Type', 'application/json');
                res.write(JSON.stringify(retorno));
                res.end();
              });
            });
          });
        }catch (exception_var) {
          console.log(exception_var);
        }
      });

     app.get('/groups', cors(corsOptionsDelegate), function (req, res) {
        try{
          var myClient;
          var retorno = {}
          var con = mysql.createConnection(myConfig);
          con.connect(function (err) {
              if (err) {
                console.log(err)
                con.end();
                res.sendStatus(500);
                return;
              }


            var query = "select id,name from glpi_groups where entities_id = 26 order by name";

            var lbs = ["Id","Nome"];

             con.query(query, function (err, result, fields) {
              if (err) {
                console.log(err)
                con.end();
                res.sendStatus(500);
                return;
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
        }catch (exception_var) {
          console.log(exception_var);
          res.sendStatus(500);

        }
      });

     app.get('/pin', cors(corsOptionsDelegate), function(req,res){
        try{
          var filtro = {};

          if(req.query.pin == 'true' || req.query.pin == 'false')
            filtro.pin =  (req.query.pin == 'true');

          mongo.listChamado(filtro,function(resultado){
            res.setHeader('Content-Type', 'application/json');
            res.write(JSON.stringify(resultado));
            res.end();
          });
        }catch (exception_var) {
          console.log(exception_var);
          res.sendStatus(500);
          return;
        }

     });

      app.post('/pin', cors(corsOptionsDelegate), function(req, res) {
        try{
          var save = {};
                      
          var id = req.body.id;

          if(req.body.pin == true || req.body.pin == false)
            save.pin = req.body.pin;
          
          if(typeof req.body.ordem == 'number')
            save.ordem = req.body.ordem;

          mongo.pinChamado(id, save,function(resultado){
            res.setHeader('Content-Type', 'application/json');
            res.write(JSON.stringify(resultado));
            res.end();
          });
        }catch (exception_var) {
          console.log(exception_var);
          res.sendStatus(500);
          return;
        }

      });

      app.delete('/pin', cors(corsOptionsDelegate), function(req, res) {
        try{
          var collectionName = req.query.collectionName;
          mongo.cleanCollection(collectionName,function(resultado){
            res.setHeader('Content-Type', 'application/json');
            res.write(JSON.stringify(resultado));
            res.end();
            return;
          });
        }catch (exception_var) {
          console.log(exception_var);
          res.sendStatus(500);
          return;
        }
      });
      app.listen(porta);
    }
}
