// App namespace

(function(window) {
	"use strict";

	var Sparky = window.Sparky;
	var messages = window.messages = Sparky.Collection();

	var table = messages.table = {
		400: { text: 'Oooops. Bad request (400)' },
		401: { text: "You don't have permission to do that. (401)" },
		402: { text: "Payment Required (402)" },
		403: { text: "Forbidden (403)" },
		404: { text: "Not Found (404)" },
		405: { text: "Method Not Allowed (405)" },
		406: { text: 'Can\'t save. The server says that\'s not acceptable (406).' },
		407: { text: "Proxy Authentication Required (407)" },
		408: { text: "Request Timeout (408)" },
		409: { text: "Conflict (409)" },
		410: { text: "Gone (410)" },
		411: { text: "Length Required (411)" },
		412: { text: "Precondition Failed (412)" },
		413: { text: "Request Entity Too Large (413)" },
		414: { text: "Request-URI Too Long (414)" },
		415: { text: "Unsupported Media Type (415)" },
		416: { text: "Requested Range Not Satisfiable (416)" },
		417: { text: "Expectation Failed (417)" },
		418: { text: "I'm a teapot (RFC 2324) (418)" },
		420: { text: "Enhance Your Calm (Twitter) (420)" },
		422: { text: "Unprocessable Entity (WebDAV) (422)" },
		423: { text: "Locked (WebDAV) (423)" },
		424: { text: "Failed Dependency (WebDAV) (424)" },
		425: { text: "Reserved for WebDAV (425)" },
		426: { text: "Upgrade Required (426)" },
		428: { text: "Precondition Required (428)" },
		429: { text: "Too Many Requests (429)" },
		431: { text: "Request Header Fields Too Large (431)" },
		444: { text: "No Response (Nginx) (444)" },
		449: { text: "Retry With (Microsoft) (449)" },
		450: { text: "Blocked by Windows Parental Controls (Microsoft) (450)" },
		499: { text: "Client Closed Request (Nginx) (499)" },
		500: { text: "Internal Server Error (500)" },
		501: { text: "Not Implemented (501)" },
		502: { text: "Bad Gateway (502)" },
		503: { text: "Service Unavailable (503)" },
		504: { text: "Gateway Timeout (504)" },
		505: { text: "HTTP Version Not Supported (505)" },
		506: { text: "Variant Also Negotiates (Experimental) (506)" },
		507: { text: "Insufficient Storage (WebDAV) (507)" },
		508: { text: "Loop Detected (WebDAV) (508)" },
		509: { text: "Bandwidth Limit Exceeded (Apache) (509)" },
		510: { text: "Not Extended (510)" },
		511: { text: "Network Authentication Required (511)" },
		598: { text: "Network read timeout error (598)" },
		599: { text: "Network connect timeout error (599)" }
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
			}, message.duration);
		}
	});

	Sparky.ctrl['messages'] = function(node) {
		this.on('ready', function() {
			messages.ready = true;
		});

		return messages;
	};

	Sparky.ctrl['message'] = function(node, message) {
		jQuery(node)
		.on('click', '[href="#remove"]', function(e) {
			delayRemove(message);
			e.preventDefault();
		});
	};
})(window);
