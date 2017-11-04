!function() {
	
	var hasPostMessage = false;
	var content = document.getElementById("content");
	var progress = document.getElementById("progress");
	var error = document.getElementById("error");
	var port = ((window.navigator.userAgent.match(/P:([0-9]+)/g) || [""])[0].replace("P:", "")) || 5000;
	var prefix = "http://localhost:"+port+"/";
	var url = prefix + "plugin/touchui/ping";
	var pass = 0;
	var retry = 0;
	var checkTimeout;
	
	var version = 1;
	
	var setMsg = function(title, subtitle, className) {
		progress.innerHTML = title;
		error.innerHTML = subtitle;
		document.body.className = className;
	}
	
	if (localStorage["mainColor"] && localStorage["bgColor"]) {
		document.getElementById("styling").innerHTML = "" +
			"svg { fill: " + localStorage["mainColor"] + "; }" +
			"#progress { color: " + localStorage["mainColor"] + "; }" +
			"#error { color: " + localStorage["mainColor"] + "; }" +
			"body { background: " + localStorage["bgColor"] + "; }" +
			"#progress span { background: " + localStorage["mainColor"] + "; color: " + localStorage["bgColor"] + "; }";
	}

	content.onload = function() {
		setTimeout(function() {
			if (!hasPostMessage) {
				setMsg("Server loaded without user interface", "Tap to retry", "error");
			}
		}, 100);
	}

	document.addEventListener("click", function() {
		if (document.body.className.indexOf("error") !== -1) {
			setMsg("Connecting to Server", "", "");
			
			pass = 0;
			++retry;
			doRequest();
		}
		if (document.body.className.indexOf("info")!== -1) {
			setMsg("", "", "hide");
		}
	}, false);

	window.addEventListener("message", function(event) {
		hasPostMessage = true;

		switch(event.data) {
			case 'loading':
				setMsg("Loading User Interface", "", "");
				
				checkTimeout = setTimeout(function() {
					setMsg("Startup failed..", "Tap to retry", "error");
				}, 60000); // Wait 1 minutes, if failed give error
				break;
				
			default:
				if(!isNaN(event.data)) {
					clearTimeout(checkTimeout);
					setMsg("", "", "hide");
					return;
				}
				if (typeof event.data === "object") {
					var msg = event.data[0];
					var file = event.data[1];
					
					if(msg !== true) { // if true this is not an error
						clearTimeout(checkTimeout);
						setMsg("Startup failed, tap to retry", ((retry > 0) ? msg : ""), "error");
					} else { // if true this is a customization

						localStorage["mainColor"] = event.data[1];
						localStorage["bgColor"] = event.data[2];

					}
				}
				break;
		}
	}, false);

	function reqListener () {
		setMsg("Loading Server", "", "");
		content.setAttribute("src", prefix);
	}

	function processRequest() {
		++pass;
		//console.log("Pass: " + pass);

		if(pass >= 30) {
			setMsg("Connecting to server interface failed..", "", "error");
			return;
		}

		var oReq = new XMLHttpRequest();
		oReq.addEventListener('load', reqListener);
		oReq.addEventListener('error', doRequest);
		oReq.addEventListener('abort', doRequest);
		oReq.open("get", url, true);
		oReq.send();
	}

	function doRequest() {
		setTimeout(processRequest, 3000);
		
		if(pass > 0) {
			progress.innerHTML = "<span id=\"badge\">" + pass + "</span> Connecting to server";
		}
	};

	doRequest();
}();