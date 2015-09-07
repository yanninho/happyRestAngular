'use strict';

describe('Service: happyRest', function () {

  // load the service's module
  beforeEach(module('happyRestClient'));

  // instantiate service
  var happyRestService, $httpBackend, easyConf;

  beforeEach(inject(function (_happyRestService_, $injector) {
    happyRestService = _happyRestService_;
    $httpBackend = $injector.get('$httpBackend');

    easyConf = happyRestService.getEasyConfig();
    easyConf.url = '/test';
    easyConf.method = 'GET';
  }));

//=====================================================
//         Tests fields    
//=====================================================

  it('should test easyCall with fields', function () {
    // configure httpbackend
    var unsatisfiedRequest = "/test";
    var satisfiedRequest = "/test?fields=name,firstname,address(city;zipcode)";
    $httpBackend.when('GET',unsatisfiedRequest).respond(404,'');
    $httpBackend.when('GET',satisfiedRequest).respond(200,'OK');

    easyConf.fields.push('name');
    easyConf.fields.push('firstname');
    easyConf.fields.push(['address',['city','zipcode']]);
    happyRestService.easyCall(easyConf);
    $httpBackend.expectGET(satisfiedRequest);
    $httpBackend.flush();

  });

  it('should throw exception when fields is not an Array', function () {
    easyConf.fields = 'Bad value';
    expect(function() {
      happyRestService.easyCall(easyConf);
    }).toThrow();
  });

  it('should throw exception when fields contain object with values is not an array', function () {
    easyConf.fields.push(['address','bad']);
    expect(function() {
      happyRestService.easyCall(easyConf);
    }).toThrow();
  });


//=====================================================
//         Tests filters    
//=====================================================

  it('should test easyCall with filters', function () {
    // configure httpbackend
    var unsatisfiedRequest = "/test";
    var satisfiedRequest = "/test?city=Perpignan,Ceret&name=toto,titi";
    $httpBackend.when('GET',unsatisfiedRequest).respond(404,'');
    $httpBackend.when('GET',satisfiedRequest).respond(200,'OK');

    easyConf.filters.push(['name',['toto','titi']]);
    easyConf.filters.push(['city',['Perpignan','Ceret']]);
    
    happyRestService.easyCall(easyConf);
    $httpBackend.expectGET(satisfiedRequest);
    $httpBackend.flush();

  });


  it('should throw exception when filters is not an Array', function () {
    easyConf.filters = 'Bad value';
    expect(function() {
      happyRestService.easyCall(easyConf);
    }).toThrow();
  });

  it('should throw exception when filters contain object with values is not an array', function () {
    easyConf.fields.push(['address','bad']);
    expect(function() {
      happyRestService.easyCall(easyConf);
    }).toThrow();
  });


//=====================================================
//         Tests sort and desc    
//=====================================================

  it('should test easyCall with sort and desc', function () {
    // configure httpbackend
    var unsatisfiedRequest = "/test";
    var satisfiedRequest = "/test?desc=city&sort=city,zicode";
    $httpBackend.when('GET',unsatisfiedRequest).respond(404,'');
    $httpBackend.when('GET',satisfiedRequest).respond(200,'OK');

    easyConf.sorts.push('-city');
    easyConf.sorts.push('zicode');

    happyRestService.easyCall(easyConf);
    $httpBackend.expectGET(satisfiedRequest);
    $httpBackend.flush();

  });

  it('should throw exception when sort is not an Array', function () {
    easyConf.sorts = 'Bad value';
    expect(function() {
      happyRestService.easyCall(easyConf);
    }).toThrow();
  });

//=====================================================
//         Tests range    
//=====================================================

  it('should test easyCall with range', function () {
    // configure httpbackend
    var unsatisfiedRequest = "/test";
    var satisfiedRequest = "/test?range=48-55";
    $httpBackend.when('GET',unsatisfiedRequest).respond(404,'');
    $httpBackend.when('GET',satisfiedRequest).respond(206, 
      [
        {'name' : 'a', 'firstname' : 'a'},
        {'name' : 'b', 'firstname' : 'b'},
        {'name' : 'c', 'firstname' : 'c'},
        {'name' : 'd', 'firstname' : 'd'},
        {'name' : 'e', 'firstname' : 'e'},
        {'name' : 'f', 'firstname' : 'f'},
        {'name' : 'g', 'firstname' : 'g'},
        {'name' : 'h', 'firstname' : 'h'}
      ],
      { 'Content-Range': '48-55/975', 
        'Accept-Range' : 'user 10',
        'Link' : '0-7;rel=first,40-47;rel=prev,56-63;rel=next,968-975;rel=last' 
      });

    easyConf.range.push(48);
    easyConf.range.push(55);

    var promise = happyRestService.easyCall(easyConf);
    promise.then(
    function(result) {
      expect(result.data.length).toEqual(10);
      expect(result.status).toEqual(206);
      expect(result.totalRecords).toEqual(20);
      expect(result.beginResult).toEqual(10);
      expect(result.endResult).toEqual(20);
      expect(result.maxAcceptedPerPage).toEqual(50);
      expect(result.firstPage.length).toEqual(2);
      expect(result.previousPage.length).toEqual(2);
      expect(result.nextPage.length).toEqual(2);
      expect(result.lastPage.length).toEqual(2);
      expect(result.firstPage[0]).toEqual(0);
      expect(result.firstPage[1]).toEqual(7);
      expect(result.previousPage[0]).toEqual(40);
      expect(result.previousPage[1]).toEqual(47);
      expect(result.nextPage[0]).toEqual(56);
      expect(result.nextPage[1]).toEqual(63);
      expect(result.lastPage[0]).toEqual(968);
      expect(result.lastPage[1]).toEqual(975);

    },
    function(error) {

    });
    $httpBackend.expectGET(satisfiedRequest);
    $httpBackend.flush();

  });

});
