


    var   Class         = require('ee-class')
        , EventEmitter  = require('ee-event-emitter')
        , log           = require('ee-log')
        , Webserver     = require('ee-webserver')
        , Middleware    = require('./Middleware')
        , debug         = require('ee-argv').has('dev-webservice');



    module.exports = new Class({
        inherits: EventEmitter


        , init: function(options) {
            this.middleware = new Middleware();

            this.webserver = new Webserver(options);
            this.webserver.on('request', this.handleRequest.bind(this));
        }


        , handleRequest: function(request, response) {
            var middlewares = this.middleware.getChain(request.hostname);
            if (debug) log.info('request on «'+request.hostname+request.pathname+'», returning «'+middlewares.length+'» of «'+this.middleware.middlewares._all.length+'» middlewares ...');
            this.nextRequest(request, response, middlewares);
        }


        , nextRequest: function(request, response, middlewares) {
            var   index = 0
                , next = function(err) {
                    if (middlewares.length > index) {
                        if (debug) log.debug('calling on middleware with index «'+index+'» ...');
                        index++;
                        middlewares[index-1](request, response, next, middlewares.length === index);
                    }
                    else response.send(404);                    
                }.bind(this);

            next();
        }


        , listen: function(callback) {
            this.webserver.listen(function() {
                this.emit('listening');
                if (typeof callback === 'function') callback();
            }.bind(this));
        }




        , close: function(callback) {
            if (this.webserver) this.webserver.close(callback);
        }



        , use: function(hostname, middleware){
            if (debug) log.debug('Adding middleware for domain «'+hostname+'» ...');
            this.middleware.add(hostname, middleware);
        }
    });


    Webserver.constants.mapTo(module.exports);