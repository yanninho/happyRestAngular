(function(window, angular, undefined) {
	'use strict';

	// retourne le nombre total de donnees pour une ressource
	var getTotalRecords = function(contentRange) {
		if (angular.isUndefined(contentRange)) {
			return undefined;
		}
		var splitSlash = contentRange.split('/');
		if (splitSlash.length !== 2) {
			return undefined;
		}
		return parseInt(splitSlash[1]);
	};
    
    // split le content-range par / puis par -
	var splitRange = function(contentRange) {
		if (angular.isUndefined(contentRange)) {
			return undefined;
		}
		var splitSlash =contentRange.split('/');
		if (splitSlash.length !== 2) {
			return undefined;
		}
		var splitRange = splitSlash[0].split('-');
		if (splitRange.length !== 2) {
			return undefined;
		}
		return splitRange;		
	};
    
    // retourne le offset
	var getBeginResult = function(contentRange) {
		var split = splitRange(contentRange);
		if (split !== undefined) {
			return parseInt(split[0]);
		}
		return undefined;
	};

	// retourne le limit
	var getEndResult = function(contentRange) {
		var split = splitRange(contentRange);
		if (split !== undefined) {
			return parseInt(split[1]);
		}
		return undefined;
	};

	// retourne le nombre max de result accepte par le serveur
	var getMaxAcceptedPerPage = function(acceptRange) {
		if (angular.isUndefined(acceptRange)) {
			return undefined;
		}
		var splitBlank = acceptRange.split(' ');
		if (splitBlank.length !== 2) {
			return undefined;
		}
		return parseInt(splitBlank[1]);
	};

	var getLinks = function(link) {
		var links = {};
		if (angular.isUndefined(link)) {
			return undefined;
		}
		var splitLinks = link.split(',');
		if (splitLinks.length !== 4) {
			return undefined;
		}
		for (var i = 0; i < 4; i++) {
			var splitLink = splitLinks[i].split(';rel=');	
			if (splitLink.length === 2) {
				links[splitLink[1]]  = splitLink[0];
			}		
		}
		return links;
	};

	var getFirstPage = function(links) {
		var tablinks = getLinks(links);

		if (angular.isDefined(tablinks)) {
			var split = tablinks.first.split('-');
			return [parseInt(split[0]),parseInt(split[1])];
		}
		return undefined;
	};

	var getPreviousPage = function(links) {
		var tablinks = getLinks(links);
		if (angular.isDefined(tablinks)) {
			var split = tablinks.prev.split('-');
			return [parseInt(split[0]),parseInt(split[1])];
		}
		return undefined;
	};

	var getNextPage = function(links) {
		var tablinks = getLinks(links);
		if (angular.isDefined(tablinks)) {
			var split = tablinks.next.split('-');
			return [parseInt(split[0]),parseInt(split[1])];
		}
		return undefined;
	};

	var getLastPage = function(links) {
		var tablinks = getLinks(links);
		if (angular.isDefined(tablinks)) {
			var split = tablinks.last.split('-');
			return [parseInt(split[0]),parseInt(split[1])];
		}
		return undefined;
	};

    // verifie l'objet config avec url et method
    var verifyConfig = function(config) {
      	var message = ', attendu : config { url, method } voir https://docs.angularjs.org/api/ng/service/$http';
      	if (angular.isUndefined(config)) {
      		new NewTechnicalException('expected object config for Rest call : [undefined]' + message);
      	}
      	if (angular.isUndefined(config.url)) {
      		new NewTechnicalException('expected url field on object config for Rest call : [undefined]' + message);
      	}
      	if (angular.isUndefined(config.method)) {
      		new NewTechnicalException('expected method field on object config for Rest call : [undefined]' + message);
      	}
    };

    var verifyFieldsObject = function(field) {
    	var message = 'field must be an array with 2 parameters : [0] = name(String), [1] = Array[String]';
    	if (Object.prototype.toString.call( field ) !== '[object Array]') {
    		new NewTechnicalException(message);
    	}	
    	if (field.length !== 2) {
    		new NewTechnicalException(message);
    	}    	
    	if (typeof field[0] !== 'string') {
    		new NewTechnicalException(message);
    	}    	
    	if (Object.prototype.toString.call( field[1] ) !== '[object Array]') {
    		new NewTechnicalException(message);
    	}	
    };

    var verifyRange = function(range) {
    	var message = 'Range must be an array with 2 parameters : [0] = offset(number), [1] = limit(number)';
    	if (Object.prototype.toString.call(range) !== '[object Array]') {
    		new NewTechnicalException(message);
    	}
    	if (range.length === 0) {
    		return;
    	}
    	if (range.length !== 2) {
    		new NewTechnicalException(message);
    	}
    	else {
	    	if (typeof range[0] !== 'number') {
	    		new NewTechnicalException(message);
	    	}
	    	if (typeof range[1] !== 'number') {
	    		new NewTechnicalException(message);
	    	}    		
    	}
    };


    var verifyFilter = function(filter) {
    	var message = 'filter must be an array with 2 parameters : [0] = name(String), [1] = Array[String] ';
    	if (Object.prototype.toString.call( filter ) !== '[object Array]') {
    		new NewTechnicalException(message);
    	}	
    	if (filter.length !== 2) {
    		new NewTechnicalException(message);
    	}    	
    	if (typeof filter[0] !== 'string') {
    		new NewTechnicalException(message);
    	}    	
    	if (Object.prototype.toString.call( filter[1] ) !== '[object Array]') {
    		new NewTechnicalException(message);
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

		var httpSuccess = function(response) {
			return {
				'data' : response.data,
				'status' : response.status,
				'totalRecords' : getTotalRecords(response.headers()['content-range']),
				'beginResult' : getBeginResult(response.headers()['content-range']),
				'endResult' : getEndResult(response.headers()['content-range']),
				'maxAcceptedPerPage' : getMaxAcceptedPerPage(response.headers()['accept-range']),
				'firstPage' : getFirstPage(response.headers()['link']),
				'previousPage' : getPreviousPage(response.headers()['link']),
				'nextPage' : getNextPage(response.headers()['link']),
				'lastPage' : getLastPage(response.headers()['link']),
			};
		};

		var httpError = function(response) {
			return $q.reject();        
		};

		var makeFilters = function(params, filters) {
			if (angular.isUndefined(filters)) {
				return;
			}
			if (Object.prototype.toString.call(filters) !== "[object Array]") {
				throw new TechnicalException('Filters must be an array');
			}
			for (var i = 0; i < filters.length; i++) {
				verifyFilter(filters[i]);
				var listValues = "";
				for (var j = 0; j < filters[i][1].length; j++) {
					if (j > 0) {
						listValues += ",";
					}
					listValues += filters[i][1][j];
				}
				params[filters[i][0]] = listValues;
			}			
		};

		var makeFields = function(fields) {
			var params = '';
			if (angular.isUndefined(fields)) {
				return undefined;
			}
			if (Object.prototype.toString.call(fields) !== "[object Array]") {
				new NewTechnicalException('fields must be an Array');
			}
			for(var prop = 0;prop < fields.length;prop++) {
				if (prop > 0) {
					params += ',';
				}
				if (typeof fields[prop] === 'string') {

					params+= fields[prop];
				}				
				if (Object.prototype.toString.call(fields[prop]) === "[object Array]") {	
					verifyFieldsObject(fields[prop]);									
					var newParam = fields[prop][0] + '(';
						for (var ind = 0;ind < fields[prop][1].length;ind++) {
							if (ind > 0) {
								newParam += ';';
							}
							newParam += fields[prop][1][ind];
						}	
						newParam += ')';
					params += newParam;					
				}
			}
			if (params === '') {
				params = undefined;
			}
			return params;
		};

		var makeSorts = function(sorts) {
			var params = '';
			if (angular.isUndefined(sorts)) {
				return undefined;
			}
			if (Object.prototype.toString.call(sorts) !== "[object Array]") {
				new NewTechnicalException('sorts must be an Array');
			}
			for(var prop = 0;prop < sorts.length;prop++) {
				var sort = sorts[prop];
				if (prop > 0) {
					sort = ',' + sort;
				}				
				if (sorts[prop].substring(0,1) === '-') {
					sort = sorts[prop].substring(1,sorts[prop].length);
				}
				params += sort;
			}
			if (params === '') {
				params = undefined;
			}
			return params;
		};

		var makeDesc = function(sorts) {
			var params = '';
			if (angular.isUndefined(sorts)) {
				return undefined;
			}
			if (Object.prototype.toString.call(sorts) !== "[object Array]") {
				new NewTechnicalException('sort must be an Array');
			}
			for(var prop = 0;prop < sorts.length;prop++) {
				if (sorts[prop].substring(0,1) === '-') {
					params += sorts[prop].substring(1,sorts[prop].length);
				}
			}
			if (params === '') {
				params = undefined;
			}			
			return params;
		};

		var makeRange = function(range) {
			if (angular.isUndefined(range)) {
				return undefined;
			}
			verifyRange(range);
			if (range.length ===0) {
				return undefined;
			}
			else {
				return range[0] + '-' + range[1];
			}			
		};

		var makeConfig = function(easyConfig) {
	      		var makedConfig = {
		      		url : easyConfig.url,
		      		method : easyConfig.method,
		      		data : easyConfig.data || '',
		      		params : { 
		      			'fields' : makeFields(easyConfig.fields),
		      			'sort' : makeSorts(easyConfig.sorts),
		      			'desc' : makeDesc(easyConfig.sorts),
		      			'range' : makeRange(easyConfig.range)		      			
		      		}
		      	};
		      	makeFilters(makedConfig.params, easyConfig.filters);
		      	return makedConfig;		
		};

		var easyConfig = {
			url: undefined, // need value
			method: 'GET', //default
			fields : [],
			filters : [],
			sorts : [],
			range : []
		};

		this.getEasyConfig = function() {
			return angular.copy(easyConfig);
		};

		this.call = function(easyConfig) {
			verifyConfig(easyConfig);
			var makedConfig = makeConfig(easyConfig);
			var promiseAppel = promiseStart.then(function () {
				return $http(makedConfig).
				then(httpSuccess,httpError);
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
				then(httpSuccess,httpError);
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