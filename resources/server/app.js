  var runrun = require('./runrun.js')

  var glpi = require('./glpi.js')

  var mantis = require('./mantis.js')

  var mongo = require('./mongo.js')

  var metrica = require('./metrica.js')

  runrun.start(10202);

  glpi.start(10203);

  mantis.start(10204);

  metrica.start(10205);

	// mongo.pinChamado({id:13784,pin:true},function(res){
	// 	console.log('callbaaack');
	// 	console.log(res);

	// });
  // mongo.pinChamado(13784,true);
 //  mongo.pinChamado(223,false);
 //  mongo.pinChamado(211,false);

	// mongo.listChamado(function(res){
	// 	// console.log('callbaaack list');
	// 	console.log(res);

	// });