(function(window, angular, undefined) {
	'use strict';
	angular.module('happyRestClient', [])
	.factory('happyRestService', function ($q, $http) { 
	      
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
	      var makeConfig = function(config, urlBackend) {

	        var finalUrl  = config.url;
	        if (angular.isDefined(urlBackend)) {
	          finalUrl = urlBackend + config.url;
	        }

	        return {
	          url : finalUrl,
	          method : config.method,
	          data : config.data || '',
	          params : config.params || undefined	        };
	      };

	      return {
	        call: function(config, urlBackend) {   
	          verifyConfig(config);  
	          var makedConfig = makeConfig(config, urlBackend);            
	          var promiseAppel = promiseStart.then(function () {
	            return $http(makedConfig).
	              success(httpSuccess).
	              error(httpError);
	          });
	          return promiseAppel;
	        }
	    };    
	});
}) (window, window.angular);