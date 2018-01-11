// App namespace

(function(window) {
	"use strict";

	var assign     = Object.assign;
	var Fn         = window.Fn;
	var Stream     = window.Stream;
	var Sparky     = window.Sparky;
	var Collection = window.Collection;
	var messages   = window.messages = Collection();

	var table = messages.table = {
		400: { status: 400, text: 'Oooops. Bad request' },
		401: { status: 401, text: "You don't have permission to do that." },
		402: { status: 402, text: "Payment Required" },
		403: { status: 403, text: "Forbidden" },
		404: { status: 404, text: "Not Found" },
		405: { status: 405, text: "Method Not Allowed" },
		406: { status: 406, text: 'Can\'t save. The server says that\'s not acceptable ' },
		407: { status: 407, text: "Proxy Authentication Required" },
		408: { status: 408, text: "Request Timeout" },
		409: { status: 409, text: "Conflict" },
		410: { status: 410, text: "Gone" },
		411: { status: 411, text: "Length Required" },
		412: { status: 412, text: "Precondition Failed" },
		413: { status: 413, text: "Request Entity Too Large" },
		414: { status: 414, text: "Request-URI Too Long" },
		415: { status: 415, text: "Unsupported Media Type" },
		416: { status: 416, text: "Requested Range Not Satisfiable" },
		417: { status: 417, text: "Expectation Failed" },
		418: { status: 418, text: "I'm a teapot (RFC 2324)" },
		420: { status: 420, text: "Enhance Your Calm (Twitter)" },
		422: { status: 422, text: "Unprocessable Entity (WebDAV)" },
		423: { status: 423, text: "Locked (WebDAV)" },
		424: { status: 424, text: "Failed Dependency (WebDAV)" },
		425: { status: 425, text: "Reserved for WebDAV" },
		426: { status: 426, text: "Upgrade Required" },
		428: { status: 428, text: "Precondition Required" },
		429: { status: 429, text: "Too Many Requests" },
		431: { status: 431, text: "Request Header Fields Too Large" },
		444: { status: 444, text: "No Response (Nginx)" },
		449: { status: 449, text: "Retry With (Microsoft)" },
		450: { status: 450, text: "Blocked by Windows Parental Controls (Microsoft)" },
		499: { status: 499, text: "Client Closed Request (Nginx)" },
		500: { status: 500, text: "Internal Server Error" },
		501: { status: 501, text: "Not Implemented" },
		502: { status: 502, text: "Bad Gateway" },
		503: { status: 503, text: "Service Unavailable" },
		504: { status: 504, text: "Gateway Timeout" },
		505: { status: 505, text: "HTTP Version Not Supported" },
		506: { status: 506, text: "Variant Also Negotiates (Experimental)" },
		507: { status: 507, text: "Insufficient Storage (WebDAV)" },
		508: { status: 508, text: "Loop Detected (WebDAV)" },
		509: { status: 509, text: "Bandwidth Limit Exceeded (Apache)" },
		510: { status: 510, text: "Not Extended" },
		511: { status: 511, text: "Network Authentication Required" },
		598: { status: 598, text: "Network read timeout error" },
		599: { status: 599, text: "Network connect timeout error" }
	};

	function delayRemove(message) {
		message.active = false;
		setTimeout(function() {
			messages.remove(message);
		}, 600);
	}

	// Redefine add methods to accept status numbers in the message table.
	['add', 'push']
	.forEach(function(method) {
		var m = messages[method];
		messages[method] = function(object) {
			if (typeof object === 'number' && !table[object]) {
				throw new Error('Messages: I don\'t have an error object for status ' + object + '. Please add one to messages.table')
			}

			object = typeof object === 'number' ? table[object] : object ;
			return m.call(messages, object);
		};
	});

	messages.on('add', function(messages, message) {
		message.active = true;

		if (message.duration) {
			setTimeout(function() {
				delayRemove(message);
			}, message.duration * 1000);
		}
	});

	Sparky.fn.messages = function(node) {
		assign(this.fn, {
			"if-status": function(node, scopes) {
				var placeholder = dom.create('comment', 'status placeholder');
				var stream = Stream.of()
					.dedup()
					.each(function(status) {
						status ?
							dom.replace(placeholder, node) :
							dom.replace(node, placeholder) ;
					});

				scopes.tap(function(message) {
					stream.push(!!message.status || false);
				});

				dom.replace(node, placeholder);
			},

			"remove-on-click": function(node, scopes) {
				scopes.tap(function(message) {
					jQuery(node)
					.on('click', function(e) {
						e.preventDefault();
						delayRemove(message);
						return;
					});
				});
			}
		});

		return Fn.of(messages);
	};
})(this);
