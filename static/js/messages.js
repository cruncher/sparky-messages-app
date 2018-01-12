// App namespace

(function(window) {
	"use strict";

	var Fn         = window.Fn;
	var Stream     = window.Stream;
	var dom        = window.dom;
	var Observable = window.Observable;
	var Sparky     = window.Sparky;

	var remove     = Fn.remove;
	var observe    = Observable.observe;

	var messages   = window.messages = Observable([]);

	var table = messages.table = {
		400: { status: 400, type: "error", text: 'Bad request' },
		401: { status: 401, type: "error", text: "You don't have permission to do that." },
		402: { status: 402, type: "error", text: "Payment Required" },
		403: { status: 403, type: "error", text: "Forbidden" },
		404: { status: 404, type: "error", text: "Not Found" },
		405: { status: 405, type: "error", text: "Method Not Allowed" },
		406: { status: 406, type: "error", text: 'Can\'t save. The server says that\'s not acceptable ' },
		407: { status: 407, type: "error", text: "Proxy Authentication Required" },
		408: { status: 408, type: "error", text: "Request Timeout" },
		409: { status: 409, type: "error", text: "Conflict" },
		410: { status: 410, type: "error", text: "Gone" },
		411: { status: 411, type: "error", text: "Length Required" },
		412: { status: 412, type: "error", text: "Precondition Failed" },
		413: { status: 413, type: "error", text: "Request Entity Too Large" },
		414: { status: 414, type: "error", text: "Request-URI Too Long" },
		415: { status: 415, type: "error", text: "Unsupported Media Type" },
		416: { status: 416, type: "error", text: "Requested Range Not Satisfiable" },
		417: { status: 417, type: "error", text: "Expectation Failed" },
		418: { status: 418, type: "error", text: "I'm a teapot (RFC 2324)" },
		420: { status: 420, type: "error", text: "Enhance Your Calm (Twitter)" },
		422: { status: 422, type: "error", text: "Unprocessable Entity (WebDAV)" },
		423: { status: 423, type: "error", text: "Locked (WebDAV)" },
		424: { status: 424, type: "error", text: "Failed Dependency (WebDAV)" },
		425: { status: 425, type: "error", text: "Reserved for WebDAV" },
		426: { status: 426, type: "error", text: "Upgrade Required" },
		428: { status: 428, type: "error", text: "Precondition Required" },
		429: { status: 429, type: "error", text: "Too Many Requests" },
		431: { status: 431, type: "error", text: "Request Header Fields Too Large" },
		444: { status: 444, type: "error", text: "No Response (Nginx)" },
		449: { status: 449, type: "error", text: "Retry With (Microsoft)" },
		450: { status: 450, type: "error", text: "Blocked by Windows Parental Controls (Microsoft)" },
		499: { status: 499, type: "error", text: "Client Closed Request (Nginx)" },
		500: { status: 500, type: "error", text: "Internal Server Error" },
		501: { status: 501, type: "error", text: "Not Implemented" },
		502: { status: 502, type: "error", text: "Bad Gateway" },
		503: { status: 503, type: "error", text: "Service Unavailable" },
		504: { status: 504, type: "error", text: "Gateway Timeout" },
		505: { status: 505, type: "error", text: "HTTP Version Not Supported" },
		506: { status: 506, type: "error", text: "Variant Also Negotiates (Experimental)" },
		507: { status: 507, type: "error", text: "Insufficient Storage (WebDAV)" },
		508: { status: 508, type: "error", text: "Loop Detected (WebDAV)" },
		509: { status: 509, type: "error", text: "Bandwidth Limit Exceeded (Apache)" },
		510: { status: 510, type: "error", text: "Not Extended" },
		511: { status: 511, type: "error", text: "Network Authentication Required" },
		598: { status: 598, type: "error", text: "Network read timeout error" },
		599: { status: 599, type: "error", text: "Network connect timeout error" }
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

	Sparky.fn["remove-on-click"] = function(node, scopestream) {
		scopestream.tap(function(message) {
			dom
			.event('click', node)
			.each(function(e) {
				e.preventDefault();
				delayRemove(message);
				return;
			});
		});
	};

	Sparky('#messages', messages);

	messages.pushError = Stream
	.of()
	.dedup()
	.map(function(error) {
		return error.response && error.response.status ?
			table[error.response.status] :
			{
				type:   'error',
				text:   error.message,
				status: error.response && error.response.status,
				error:  error
			} ;
	})
	.each(function(message) {
		messages.push(message);
	})
	.push;

})(this);
