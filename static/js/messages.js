// App namespace

(function(window) {
	"use strict";

	var Fn         = window.Fn;
	var Stream     = window.Stream;
	var dom        = window.dom;
	var Observable = window.Observable;
	var Sparky     = window.Sparky;

	var overload   = Fn.overload;
	var remove     = Fn.remove;
	var toType     = Fn.toType;
	var observe    = Observable.observe;

	var messages   = Observable([]);
	var table = {
		400: { status: 400, type: "error", message: 'Bad request' },
		401: { status: 401, type: "error", message: "You don't have permission to do that." },
		402: { status: 402, type: "error", message: "Payment Required" },
		403: { status: 403, type: "error", message: "Forbidden" },
		404: { status: 404, type: "error", message: "Not Found" },
		405: { status: 405, type: "error", message: "Method Not Allowed" },
		406: { status: 406, type: "error", message: 'Can\'t save. The server says that\'s not acceptable ' },
		407: { status: 407, type: "error", message: "Proxy Authentication Required" },
		408: { status: 408, type: "error", message: "Request Timeout" },
		409: { status: 409, type: "error", message: "Conflict" },
		410: { status: 410, type: "error", message: "Gone" },
		411: { status: 411, type: "error", message: "Length Required" },
		412: { status: 412, type: "error", message: "Precondition Failed" },
		413: { status: 413, type: "error", message: "Request Entity Too Large" },
		414: { status: 414, type: "error", message: "Request-URI Too Long" },
		415: { status: 415, type: "error", message: "Unsupported Media Type" },
		416: { status: 416, type: "error", message: "Requested Range Not Satisfiable" },
		417: { status: 417, type: "error", message: "Expectation Failed" },
		418: { status: 418, type: "error", message: "I'm a teapot (RFC 2324)" },
		420: { status: 420, type: "error", message: "Enhance Your Calm (Twitter)" },
		422: { status: 422, type: "error", message: "Unprocessable Entity (WebDAV)" },
		423: { status: 423, type: "error", message: "Locked (WebDAV)" },
		424: { status: 424, type: "error", message: "Failed Dependency (WebDAV)" },
		425: { status: 425, type: "error", message: "Reserved for WebDAV" },
		426: { status: 426, type: "error", message: "Upgrade Required" },
		428: { status: 428, type: "error", message: "Precondition Required" },
		429: { status: 429, type: "error", message: "Too Many Requests" },
		431: { status: 431, type: "error", message: "Request Header Fields Too Large" },
		444: { status: 444, type: "error", message: "No Response (Nginx)" },
		449: { status: 449, type: "error", message: "Retry With (Microsoft)" },
		450: { status: 450, type: "error", message: "Blocked by Windows Parental Controls (Microsoft)" },
		499: { status: 499, type: "error", message: "Client Closed Request (Nginx)" },
		500: { status: 500, type: "error", message: "Internal Server Error" },
		501: { status: 501, type: "error", message: "Not Implemented" },
		502: { status: 502, type: "error", message: "Bad Gateway" },
		503: { status: 503, type: "error", message: "Service Unavailable" },
		504: { status: 504, type: "error", message: "Gateway Timeout" },
		505: { status: 505, type: "error", message: "HTTP Version Not Supported" },
		506: { status: 506, type: "error", message: "Variant Also Negotiates (Experimental)" },
		507: { status: 507, type: "error", message: "Insufficient Storage (WebDAV)" },
		508: { status: 508, type: "error", message: "Loop Detected (WebDAV)" },
		509: { status: 509, type: "error", message: "Bandwidth Limit Exceeded (Apache)" },
		510: { status: 510, type: "error", message: "Not Extended" },
		511: { status: 511, type: "error", message: "Network Authentication Required" },
		598: { status: 598, type: "error", message: "Network read timeout error" },
		599: { status: 599, type: "error", message: "Network connect timeout error" }
	};

	function delayRemove(message) {
		message.active = false;
		setTimeout(function() {
			remove(messages, message);
		}, 600);
	}

	observe(messages, '', function(messages, changes) {
		changes && changes.added.forEach(function(message) {
			message.active = true;

			if (message.duration) {
				setTimeout(function() {
					delayRemove(message);
				}, message.duration);
			}
		});
	});

	// Sparky

	Sparky.fn["remove-on-click"] = function(node, scopestream) {
		scopestream.tap(function(message) {
			dom
			.events('click', node)
			.each(function(e) {
				e.preventDefault();
				delayRemove(message);
				return;
			});
		});
	};

	function isError(object) {
		// Detect error-like object by duck typing
		return object
		&& typeof object.stack === 'string'
		&& typeof object.message === 'string' ;
	}

	// Export

	window.messages = Stream
	.of()
	// Todo: Dedup will cause problems if, eg. sending a string twice. It
	// should only be applied to error objects really.
	.dedup()
	.map(overload(toType, {
		string: function(string) {
			return table[string] || {
				type: 'info',
				message: string
			};
		},

		number: function(number) {
			return table[number] || {
				type:   'info',
				status: number
			};
		},

		object: function(object) {
			return isError(object) ?
				object.response && object.response.status ?
					table[object.response.status] :
				{
					type:    'error',
					message: object.message,
					error:   object
				} :
			object ;
		},

		default: function(value) {
			throw new Error('messages: .push() accepts a string, number or object; you gave it ' + (typeof value));
		}
	}))
	.each(function(message) {
		messages.push(message);
	});

	Sparky('#messages', messages);

	window.messages.table = table;

})(this);
