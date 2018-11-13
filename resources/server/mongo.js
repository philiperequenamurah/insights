
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'myproject';

const collsName = 'chamados';

// Use connect method to connect to the Server
const chamada = function (funcao, retorno){
	var client = new MongoClient(url);
	client.connect(function(err) {
	  assert.equal(null, err);

	  const db = client.db(dbName);

	  funcao(db, function(result) {
	    client.close();
	    retorno(result);
	  });

	});
}

const  orderChamado = function (id, data, callback){
  	var findDocumentsPreUpdate = function(db, callback) {
	  // Get the documents collection
	  	const collection = db.collection(collsName);
	  // Find some documents
		collection.find({pin:true}).toArray(function(err, docs) {
			var retorno = docs;
	        let sortBy = 'ordem';
	        let sortAsc = true;
	        let sortDefault = '_id';

	        retorno.sort(function (a,b){
	            if (a[sortBy] < b[sortBy]) return sortAsc ? -1 : 1;
	            else if (a[sortBy] > b[sortBy]) return sortAsc ? 1 : -1;
	            else {
	                if (a[sortDefault] < b[sortDefault]) return sortAsc ? -1 : 1;
	                else if (a[sortDefault] > b[sortDefault]) return sortAsc ? 1 : -1;
	                else return 0;
	            };
	        })
			for (var i = 0; i < retorno.length; i++) {
				if(retorno[i]._id == id){
					var node = retorno[i];
					retorno.splice(i,1)
					var ordemFinal = data.ordem;
					if(i > ordemFinal) 
						retorno.splice(ordemFinal -1,0,node);
					else 
						retorno.splice(ordemFinal,0,node);
					break;

				}
			}
			
			for (var i = 0; i < retorno.length; i++) {
   			    const collection = db.collection(collsName);
			    collection.updateOne({ _id : retorno[i]._id }
			      , { $set: {ordem: i}}, function(err, result) {
			    });  
			}
		    callback({ok:"ok"});
		});
	};

	chamada(findDocumentsPreUpdate,callback);
 };

module.exports = {
  pinChamado: function (id, data, retorno){
  	var update = function(db, callback) {
  // Get the documents collection
	  const collection = db.collection(collsName);
	  // Update document where a is 2, set b equal to 1
	  collection.updateOne({ _id : id }
	    , { $set: data }, function(err, result) {

	    if(result.result.n < 1){
	    	data._id = id;
		  collection.insertMany([
		    data
		  ], function(err, result) {
		    if(typeof data.ordem == 'number')
		    	orderChamado(id,data,callback)
		    else
			    callback(result.result);
		  });
	    }else{
		    if(typeof data.ordem == 'number')
		    	orderChamado(id,data,callback)
		    else
			    callback(result.result);
	    }
	  });  
	};

	chamada(update,retorno);
  },
  listChamado: function (filtro, retorno) {
  	var findDocuments = function(db, callback) {
	  // Get the documents collection
	  const collection = db.collection(collsName);
	  // Find some documents
	  collection.find(filtro).toArray(function(err, docs) {
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
		    callback({});
		};

		chamada(removeAll,retorno);		
	}

}

