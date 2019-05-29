/* CITATION:

	Derived from node "content-filter" package (MIT licensed)
	Created by GitHub user "efkan"
	https://github.com/efkan/content-filter

*/

// Middleware that filters unwanted words from parameters

var Filter = require('bad-words'),
    wordFilter = new Filter();

module.exports = function filter(options) {

	options = options || {};

	var checkNames = false;
	var typeList = options.typeList || ['object', 'function', 'string'];
	var methodList = options.methodList || ['GET', 'POST', 'PUT', 'DELETE'];
	var urlMessage = options.urlMessage || 'A forbidden expression has been found in URL: ';
	var bodyMessage = options.bodyMessage || 'A forbidden expression has been found in form data: ';
	var appendFound = options.appendFound || false;
	var dispatchToErrorHandler = (options.dispatchToErrorHandler === true) ? true : false;

	var errorStatus = 403
	var errorCode = "FORBIDDEN_CONTENT"

	return function filter(req, res, next) {
		/* Only examine the valid methodList */
		if (methodList.indexOf(req.method) === -1) {
			return next();
		}
		var found = null;
		console.log("filter.");

		/* Examining the req.body object If there is a req.body object it must be checked */
		if (req.body && Object.keys(req.body).length) {
			// // hrstart is used for to calculate the elapsed time
			// // https://nodejs.org/api/process.html#process_process_hrtime
			// var hrstart = process.hrtime()
			jsonToString(req.body, typeList, checkNames, function(str){
				if(wordFilter.isProfane(str)) found = str;
				console.log("param:" + str);

				if (found) {
					if (dispatchToErrorHandler) {
						return next({status: errorStatus, code: errorCode, message: urlMessage + (appendFound ? found : "")})
					} else {
						return res.status(errorStatus).send(bodyMessage + (appendFound ? found : ""));
					}
				}
				next();
			});
		} else {
			next();
		}
	};
};

function jsonToString(json, typeList, checkNames, callback) {
    var visitNode = function(obj) {
        var type = typeof(obj);

        if (obj === null || typeList.indexOf(type) === -1) {
            return '';
        }

        switch (type) {
            case 'string':
                return obj;

            case 'number':
            case 'boolean':
            case 'undefined':
                return String(obj);

            default:
                return visitObject(obj);
        }
    }

    var visitObject = function(obj) {
        var buffer = '';

        var keys = Object.keys(obj);
        var includeKey = checkNames && !Array.isArray(obj);

        for (var i = 0; i < keys.length; ++i) {
            var key = keys[i];
            buffer += (includeKey ? key : '') + visitNode(obj[key]);
        }

        return buffer;
    }

    return callback(visitNode(json));
}
