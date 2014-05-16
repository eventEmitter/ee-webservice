	
	var   Class 		= require('ee-class')
		, log 			= require('ee-log')
		, assert 		= require('assert')
		, travis 		= require('ee-travis');



	var   request 		= require('request')
		, Webservice 	= require('../')	
		, crypto 		= require('crypto');


	var md5 = function(buf){
		return crypto.createHash('md5').update(buf).digest('hex');
	}


	var config = {
		  port: 13023
		, interface: Webservice.IF_ANY
	};




	describe('The Webservice', function(){
		var service = new Webservice(config);


		it('should be able to open a port', function(done){		
			service.use({
				request: function(request, response, next){
					if (request.pathname === '/fabian') response.send(200, {'Content-Type': 'Application/JSON'}, JSON.stringify({name: 'Fabian'}));
					else next();
				}
			});

			service.listen(done);
		});

		it('should be able to add a function as middleware', function(){
			service.use(function(request, response, next){
				response.send(600);
			});
		});

		it('should be able a domain specific middleware', function(done){
			service.use('www.127.0.0.1.xip.io', function(request, response, next){
				response.send(201);
			});
			done();
		});

		it('should be able to handle a request', function(done){		
			request.get('http://127.0.0.1:13023/fabian', function(err, res, body){
				done(res.statusCode === 200 ? null : new Error('got invaild respons statuscode «'+res.statusCode+'»!'));
			});
		});

		it('should be able to handle another request', function(done){		
			request.get('http://127.0.0.1:13023/michael', function(err, res, body){
				done(res.statusCode === 600 ? null : new Error('got invaild respons statuscode «'+res.statusCode+'»!'));
			});
		});

		it('should be able to handle a request on a specific domain', function(done){		
			request.get('http://www.127.0.0.1.xip.io:13023/fabian', function(err, res, body){
				done(res.statusCode === 201 ? null : new Error('got invaild respons statuscode «'+res.statusCode+'»!'));
			});
		});

		it('should be able to close its socket', function(done){		
			service.close(done);
		});
	});
	