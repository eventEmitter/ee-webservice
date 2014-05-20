# ee-webservice

Webservice implementation with support for middleware

## build status

[![Build Status](https://travis-ci.org/eventEmitter/ee-webservice.png?branch=master)](https://travis-ci.org/eventEmitter/ee-webservice)

## Usage

### Constructor

	var Webservice = require('ee-webservice');

	var service = new Webservice({
		  port: 		13023
		, interface: 	Webservice.IF_ANY
	});


### use method

Every middleware will be called with exactly 3 parameters:

- request: request object of the ee-webserver
- response: response object of the the ee-webserver
- next: callback to be called for executing the next middleware

	
	// use a simple middleware for all hostnames not matched by a specific rule
	service.use(function(request, response, next){});

	// use a middleware which has a request method for all hostnames not matched by a specific rule
	service.use({request: function(request, response, next){}});

	// use a middleware for a single hostname
	service.use('joinbox.com', function(request, response, next){});

	// use a middleware for two absolute domain names and one with a wildcard subdomain
	service.use(['*joinbox.com', 'eventemitter.com', 'www.eventemitter.com'], function(request, response, next){});

	// use a middleware for all hostnames
	service.use('*', function(request, response, next){});




### Interface Configurations

	IF_PUBLIC: 1			// listen on all public interfaces
	IF_PRIVATE: 2			// listen on all private interfaces ( RFC 1918, 192.168.x.y, 10.x.y.z, 172.16.x.y - 172.31.x.y, fc00:: )
	IF_INTERNAL: 3 			// lis§ten on localhost ( 127.0.0.1, ::1, fe80::1 )
	IF_LOCAL: 4 			// link local 169.254.1.x to 169.254.254.y, fe80::
	IF_ANY: 5				// listen on any interface
	IF_V4_PRIVATE: 10		// private v4 interfaces
	IF_V6_PRIVATE: 20 		// private v6 interfaces
	IF_V4_INTERNAL: 11 		// 127.0.0.1
	IF_V6_INTERNAL: 21 		// fc00::
	IF_V4_PUBLIC: 12
	IF_V6_PUBLIC: 22
	IF_V4_LOCAL: 13 		// §169.254.1.x to 169.254.254.y
	IF_V6_LOCAL: 23 		// fe80::
	IF_V4_ANY: 14
	IF_V6_ANY: 24