window.addEventListener("load",function(e){
	console.log("DOM Loaded");
	document.getElementById("btnCanvas").click();
	main();
});
function log(message){
	var l = window.location;
	if(l.hash== "#debug"){
		console.log(message);
	}
}
function main(){
	log("Inside Main");	
	const canvs= document.getElementById("canvs");
	if(canvs){
		log("Canvas obj is potentially valid");
		const gl = canvs.getContext("webgl");
		if(gl === null){
			console.log("Unable to initialize");
			return;
		}
		log("Gl Context Created");
		gl.clearColor(0.0,0.0,0.0,1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}else{
		log("Canvas is invalid");
	}
}
