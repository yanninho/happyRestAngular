(function(window, angular, undefined) {
	'use strict';
	
	function NewTechnicalException(message) {
	  function TechnicalException(message) {
	    this.name = 'TechnicalException';
	    this.message = message;
	  }
	  TechnicalException.prototype = new Error();
	  TechnicalException.prototype.constructor = TechnicalException;     
	  throw new TechnicalException(message);
	}

	function SimpleCall($q, $http) {
		var promiseStart = $q.when('start');

		var httpSuccess = function(data, status, headers, config) {
			return data;
		};

		var httpError = function(data, status, headers, config) {
			return $q.reject();        
		};

      // verifie l'objet config avec url et method
      var verifyConfig = function(config) {
      	var message = ', attendu : config { url, method } voir https://docs.angularjs.org/api/ng/service/$http';
      	if (angular.isUndefined(config)) {
      		newTechnicalException('objet config pour un appel Rest : [undefined]' + message);
      	}
      	if (angular.isUndefined(config.url)) {
      		newTechnicalException('url dans config pour un appel Rest : [undefined]' + message);
      	}
      	if (angular.isUndefined(config.method)) {
      		newTechnicalException('method dans config pour un appel Rest : [undefined]' + message);
      	}
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

		this.call = function() {
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

	      return {
	        call: function(config) {   
	          return simpleCall.call(config);
	        }
	    };    
	});
}) (window, window.angular);