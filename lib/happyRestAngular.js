(function(window, angular, undefined) {
	'use strict';

    // verifie l'objet config avec url et method
    var verifyConfig = function(config) {
      	var message = ', attendu : config { url, method } voir https://docs.angularjs.org/api/ng/service/$http';
      	if (angular.isUndefined(config)) {
      		new NewTechnicalException('objet config pour un appel Rest : [undefined]' + message);
      	}
      	if (angular.isUndefined(config.url)) {
      		new NewTechnicalException('url dans config pour un appel Rest : [undefined]' + message);
      	}
      	if (angular.isUndefined(config.method)) {
      		new NewTechnicalException('method dans config pour un appel Rest : [undefined]' + message);
      	}
    };
	
	function NewTechnicalException(message) {
	  function TechnicalException(message) {
	    this.name = 'TechnicalException';
	    this.message = message;
	  }
	  TechnicalException.prototype = new Error();
	  TechnicalException.prototype.constructor = TechnicalException;     
	  throw new TechnicalException(message);
	}

	function EasyCall($q, $http) {
		var promiseStart = $q.when('start');

		var httpSuccess = function(data, status, headers, config) {
			return data;
		};

		var httpError = function(data, status, headers, config) {
			return $q.reject();        
		};

		var makeFields = function(fields) {
			var params = [];
			if (angular.isUndefined(fields)) {
				return undefined;
			}
			if (Object.prototype.toString.call(fields) !== "[object Array]") {
				return undefined;
			}
			for(var prop = 0;prop < fields.length;prop++) {
				if (typeof fields[prop] === 'string') {
					params.push(fields[prop]);
				}
				if (typeof fields[prop] === 'Object') {
					if (fields[prop].name !== undefined && fields[prop].values !== undefined && fields[prop].values === Array) {
							var newParam = fields[prop].name + '(';
							for (var ind = 0;ind < fields[prop].values.length;ind++) {
								if (ind > 0) {
									newParam += ',';
								}
								newParam += fields[prop].values[ind];
							}	
							newParam += ')';
							params.push(newParam);
					}
				}
			}
			return params;
		};

		var makeConfig = function(easyConfig) {
	      	return {
	      		url : easyConfig.url,
	      		method : easyConfig.method,
	      		data : easyConfig.data || '',
	      		params : { 
	      			'fields' : makeFields(easyConfig.fields)
	      		}	        
	      	};			
		};

		var easyConfig = {
			url: undefined, // need value
			method: 'GET', //default
			fields : []
		};

		this.getEasyConfig = function() {
			return angular.copy(easyConfig);
		};

		this.call = function(easyConfig) {
			verifyConfig(easyConfig);
			var makedConfig = makeConfig(easyConfig);
			var promiseAppel = promiseStart.then(function () {
				return $http(makedConfig).
				success(httpSuccess).
				error(httpError);
			});
			return promiseAppel;				
		};

	}


	function SimpleCall($q, $http) {
		var promiseStart = $q.when('start');

		var httpSuccess = function(data, status, headers, config) {
			return data;
		};

		var httpError = function(data, status, headers, config) {
			return $q.reject();        
		};

      //construit une configuration pour le service $http
      var makeConfig = function(config) {

      	return {
      		url : config.url,
      		method : config.method,
      		data : config.data || '',
      		params : config.params || undefined	        
      	};
      };

		this.call = function(config) {
			verifyConfig(config);  
			var makedConfig = makeConfig(config);            
			var promiseAppel = promiseStart.then(function () {
				return $http(makedConfig).
				success(httpSuccess).
				error(httpError);
			});
			return promiseAppel;			
		};		
	}

	angular.module('happyRestClient', [])
	.factory('happyRestService', function ($q, $http) { 
	      
		  var simpleCall = new SimpleCall($q, $http); 

		  var easyCall = new EasyCall($q, $http); 

	      return {
	        call: function(config) {   
	          return simpleCall.call(config);
	        },
	        getEasyConfig: function() {
	        	return easyCall.getEasyConfig();
	        },
	        easyCall: function(config) {
	        	return easyCall.call(config);
	        }
	    };    
	});
}) (window, window.angular);