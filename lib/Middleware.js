!function(){

	var   Class 		= require('ee-class')
		, Arguments 	= require('ee-arguments')
		, log 			= require('ee-log')
		, type 			= require('ee-types')
		, LRU 			= require('ee-lru-cache')
        , debug         = require('ee-argv').has('dev-webservice');



	module.exports = new Class({

		init: function() {
			this.index 			= 0;
			this.hostnames 		= [];
			this.middlewares 	= {_all: [], _default: []}
			this.cache 			= new LRU({
				limit: 10000
			});
		}



		, add: function() {
			var   args 			= new Arguments(arguments)
				, middleware 	= args.getObject(args.getFunction())
				, hostname 		= args.getString()
				, hostnames		= args.getArray();


			// check for validity
			if (middleware) {
				if (type.function(middleware.request)) middleware = middleware.request.bind(middleware);
				else if (!type.function(middleware)) throw new Error('Cannot add middleware, must be typeof function or must have a request property typeof function!');
			}

			if (!hostname && !hostnames) {
				// generic hostname (add to default stack)
				this.middlewares._default.push(middleware);
			}
			else if (hostname) {
				// a single hostname
				this._addMiddleware(hostname, middleware);
			}
			else {
				// a multiple hostnames
				hostnames.forEach(function(hn){
					this._addMiddleware(hn, middleware);
				}.bind(this));
			}
		}



		, _addMiddleware: function(hostname, middleware) {
			hostname = hostname.toLowerCase().trim();

			if (hostname === '*') {
				// add to all middleware
				Object.keys(this.middlewares).forEach(function(key){
					this.middlewares[key].push(middleware);
				}.bind(this));
			}
			else {
				// add to specific middleware
				this._storeMiddleware(hostname, middleware);
			}
		}



		, _storeMiddleware: function(hostname, middleware) {
			if (!this.middlewares[hostname]) {
				// the hostname was not registered before
				this.middlewares[hostname] = this.middlewares._all.slice();

				// add to index
				if (hostname.indexOf('*') >= 0){
					this.hostnames.push({
						  reg: new RegExp(hostname.replace(/([.+?^=!:${}()|\[\]\/\\])/g, "\\$1").replace('*','.*'), 'gi')
						, hostname: hostname
					});
				}
				else {
					this.hostnames.push({
						  str: hostname
						, hostname: hostname
					});
				}
			}

			// store middleware
			this.middlewares[hostname].push(middleware);			
		}



		, getChain: function(hostname) {
			var match;

			if (this.cache.has(hostname)) return this.middlewares[this.cache.get(hostname)];
			else {
				// find a match
				this.hostnames.some(function(hn) {
					if (hn.str && hn.str === hostname) match = hn;
					else if (hn.reg && hn.reg.test(hostname)) match = hn;
					if (match) return true;
				}.bind(this));

				if (match) {
					// we've got a specific middleware chain for this
					this.cache.set(hostname, match.hostname);
					return this.middlewares[match.hostname];
				}
				else {
					// return the generic middleware chain
					this.cache.set(hostname, '_default');
					return this.middlewares._default;
				}
			}
		}
	});
}();
