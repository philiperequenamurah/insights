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
      res.write("Central de serviços de Métricas do GLPI");     
      res.end();   
    });

      app.get('/situacao', cors(corsOptionsDelegate), function (req, res) {
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

            var query = "";
            query += " select ";
             query += " coalesce(abertura.dia,solucao.dia,fechamento.dia) dia, ";
             query += " abertura.tipo,  COALESCE(max(abertura.total),0) as totalAbertura,  ";
             query += " COALESCE(max(solucao.total),0) as totalSolucao, ";
             query += " COALESCE(max(fechamento.total),0) as totalFechamento, ";
             query += " COALESCE(max(solucao.media),0) as mediaSolucao, ";
             query += " COALESCE(max(fechamento.media),0) as mediaFechamento, ";
             query += " COALESCE(max(fechamento.mediaEspera),0) as mediaEspera, ";
             query += " COALESCE(max(solucao.mediaReal),0) as realSolucao, ";
             query += " COALESCE(max(fechamento.mediaReal),0) as realFechamento ";
             query += " from (select DATE(date) dia, type tipo, count(*) total from  glpi_tickets where itilcategories_id <> 260 group by DATE(date), type) as abertura ";
             query += " left join (select DATE(solvedate) dia, type tipo, count(*) total, (avg(solve_delay_stat)/60/60/24) media, avg((UNIX_TIMESTAMP(solvedate) - UNIX_TIMESTAMP(date))/60/60/24) mediaReal from  glpi_tickets where itilcategories_id <> 260 group by DATE(solvedate), type) as solucao on solucao.dia = abertura.dia and solucao.tipo = abertura.tipo ";
             query += " left join (select DATE(closedate) dia, type tipo, count(*) total, (avg(close_delay_stat)/60/60/24) media, ";
             query += " ((sum(waiting_duration) / (sum(case when waiting_duration > (60*30) then 1 else 0 end)))/60/60/24) mediaEspera,  avg((UNIX_TIMESTAMP(closedate) - UNIX_TIMESTAMP(date))/60/60/24) mediaReal from  glpi_tickets where itilcategories_id <> 260 group by DATE(closedate), type) as fechamento on fechamento.dia = abertura.dia and fechamento.tipo = abertura.tipo ";

            query += " where  1 = 1 ";
            
            if(req.query.inicio != '' && req.query.inicio != null && req.query.inicio != '0000-00-00')
                query += " and STR_TO_DATE(abertura.dia, '%Y-%m-%d') >=  '" + req.query.inicio + "' ";

            if(req.query.termino != '' && req.query.termino != null && req.query.termino != '0000-00-00')
                query += " and STR_TO_DATE(abertura.dia, '%Y-%m-%d') <= '" + req.query.termino + "' ";

            query += " group by abertura.dia, abertura.tipo";
            query += " order by coalesce(abertura.dia,solucao.dia,fechamento.dia) desc , abertura.tipo desc;";
            
            var lbs = ["Data","Tipo","Total Abertura", "Total Solucao","Total Fechamento", "Media Solucao", "Media Fechamento", "Media Espera", "Solucao Real", "Fechamento Real"];

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

      app.get('/situacaoPorFollowup', cors(corsOptionsDelegate), function (req, res) {
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

            var query = "";
            query += " select ";
            query += " DATE(tf.date), u.name, count(distinct tf.id), count(distinct t.id) from glpi_ticketfollowups tf ";
            query += " inner join glpi_tickets t on t.id = tf.tickets_id and t.itilcategories_id <> 260 ";
            query += " inner join glpi_users u on u.id = tf.users_id and u.id <> 126 ";
            query += " where  1 = 1 ";
            
            if(req.query.inicio != '' && req.query.inicio != null && req.query.inicio != '0000-00-00')
                query += " and STR_TO_DATE(tf.date, '%Y-%m-%d') >=  '" + req.query.inicio + "' ";

            if(req.query.termino != '' && req.query.termino != null && req.query.termino != '0000-00-00')
                query += " and STR_TO_DATE(tf.date, '%Y-%m-%d') <= '" + req.query.termino + "' ";

            query += " group by DATE(tf.date), u.name ";
            query += " order by DATE(tf.date) desc, u.name asc ";
            
            var lbs = ["Data","Nome","Total Followup", "Total Tickets"];

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

      app.get('/movimentoPorEquipe', cors(corsOptionsDelegate), function (req, res) {
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

            var query = "";
            query += " select data, equipe, sum(case when destino = 15 then 1 else 0 end) totalEntrada, ";
            query += " sum(case when destino = 16 then 1 else 0 end) totalSaida ";
            query += " from (select DATE(date_mod) data, (case when linked_action = 15 then new_value ";
            query += " else old_value end)  equipe, linked_action destino  ";
            query += " from glpi_logs  ";
            query += " where itemtype = 'Ticket' and linked_action in (15,16)  ";
            query += " and itemtype_link like 'Group' ";
            query += " order by DATE(date_mod) desc) tabela ";
            query += " where  1=1 ";

            if(req.query.inicio != '' && req.query.inicio != null && req.query.inicio != '0000-00-00')
                query += " and STR_TO_DATE(data, '%Y-%m-%d') >=  '" + req.query.inicio + "' ";

            if(req.query.termino != '' && req.query.termino != null && req.query.termino != '0000-00-00')
                query += " and STR_TO_DATE(data, '%Y-%m-%d') <= '" + req.query.termino + "' ";

            query += " and (equipe like 'Desenvolvimento%' or equipe like 'Infraestrutura%' ";
            query += " or equipe like 'Análise%' or equipe like 'Teste%' ";
            query += " or equipe like 'Service%') ";
            query += " group by data desc,equipe asc ";

            var lbs = ["Data","Equipe","Total Entrada", "Total Saida"];

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
