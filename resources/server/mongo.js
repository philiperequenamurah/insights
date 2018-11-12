
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'myproject';

const collsName = 'chamados';

// Use connect method to connect to the Server
const chamada = function (funcao, retorno){
	// console.log('chamada');
	var client = new MongoClient(url);
	client.connect(function(err) {
	  assert.equal(null, err);
	  // console.log("Connected successfully to server");

	  const db = client.db(dbName);

	  funcao(db, function(result) {
	    client.close();
	    retorno(result);
	  });

	});
}

module.exports = {
  pinChamado: function (data, retorno){
  	// console.log('entrou ' +data.id + ' - ' + data.pin);
	// primeiro update se tiver zero chama insert
  	var update = function(db, callback) {
  // Get the documents collection
	  const collection = db.collection(collsName);
	  // Update document where a is 2, set b equal to 1
	  collection.updateOne({ _id : data.id }
	    , { $set: { pin : data.pin } }, function(err, result) {
	    // assert.equal(err, null);
	    if(result.result.n < 1){
		  collection.insertMany([
		    {_id: data.id, pin: data.pin}
		  ], function(err, result) {
		    assert.equal(err, null);
		    // console.log("Inserido");
		    callback(result.result);
		  });
	    }else{
	    	callback(result.result);
	    }
	  });  
	};

	chamada(update,retorno);
  },

  listChamado: function (filtro, retorno) {
  	// console.log('listChamado');
  	var findDocuments = function(db, callback) {
	  // Get the documents collection
	  const collection = db.collection(collsName);
	  // Find some documents
	  collection.find(filtro).toArray(function(err, docs) {
	  	console.log('entrou');
	  	console.log(err);
	    assert.equal(err, null);
	    // console.log("Found the following records");
	    // console.log(docs)
	    callback(docs);
	  });
	};

	chamada(findDocuments,retorno);
  },
  	cleanCollection: function (collectionName, retorno){
	  	var removeAll = function(db, callback) {
		  // Get the documents collection
		  const collection = db.collection(collectionName);
		  // Find some documents
		  collection.remove({})
		  // . toArray(function(err, result) {
		  // 	console.log('entrou');
		  	console.log('apagou tudo');
		    // assert.equal(err, null);
		    // console.log("Found the following records");
		    // console.log(docs)
		    callback({});
		  // });
		};

		chamada(removeAll,retorno);		
	}

}
