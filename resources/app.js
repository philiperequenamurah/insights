  var runrun = require('./runrun.js')

  var glpi = require('./glpi.js')

  var mantis = require('./mantis.js')

  var mongo = require('./mongo.js')

  runrun.start(10202);

  glpi.start(10203);

  mantis.start(10204);

	mongo.inserirPrioridade({});