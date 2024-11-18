"use strict";
function log(message){
	var l = window.location;
	var lw = document.getElementById("log");
	if(l.hash== "#debug"){
		console.log(message);
	}
	if(lw){
		var e = document.createElement("p");
		e.innerText = message ;
		lw.appendChild(e);
	}
}
function error(message){
	var l = window.location;
	var lw = document.getElementById("log");
	if(l.hash== "#debug"){
		console.trace();
		console.error(message);
	}
	if(lw){
		var e = document.createElement("p");
		e.className = "error";
		e.innerText = message ;
		lw.appendChild(e);
	}

}
function warning(message){
	var l = window.location;
	var lw = document.getElementById("log");
	if(l.hash=="#debug"){
		console.warn(message);
	}
	if(lw){
		var e = document.createElement("p");
		e.className="warning";
		e.innerText= message;
		lw.appendChild(e);
	}
}
function info(message){
	var l = window.location;
	var lw = document.getElementById("log");
	if(l.hash=="#debug"){
		console.info(message);
	}
	if(lw){
		var e = document.createElement("p");
		e.className="info";
		e.innerText= message;
		lw.appendChild(e);
	}
}
function success(message){
	var l = window.location;
	var lw = document.getElementById("log");
	if(l.hash=="#debug"){
		console.info(message);
	}
	if(lw){
		var e = document.createElement("p");
		e.className="success";
		e.innerText= message;
		lw.appendChild(e);
	}
}
