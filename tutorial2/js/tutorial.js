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
	canvs.width = 800;
	canvs.height = 600;
	canvs.style.width = 800;
	canvs.style.height = 600;
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

		var vertexShaderSource = document.getElementById("vertex-shader-1").text;
		log("Vertex:"+vertexShaderSource);
		var fragmentShaderSource = document.getElementById("fragment-shader-1").text;
		log("Fragment:"+fragmentShaderSource);
		var vertexShader = createShader(gl,gl.VERTEX_SHADER,vertexShaderSource);
		var fragmentShader = createShader(gl,gl.FRAGMENT_SHADER,fragmentShaderSource);

		var program = createProgram(gl,vertexShader,fragmentShader);

		var positionAttributeLocation = gl.getAttribLocation(program,"a_position");
		var positionBuffer = gl.createBuffer();

		gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);

		var positions = [ 0,0, 0, 0.5,0.7,0 ];

		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions),gl.STATIC_DRAW);
		//webglUtils.resizeCanvasToDisplaySize(gl.canvas);
		gl.viewport(0,0,gl.canvas.width,gl.canvas.height);
		
		gl.clearColor(0,0,0,0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(program);

		gl.enableVertexAttribArray(positionAttributeLocation);
		
		gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
		var size= 2;
		var type= gl.FLOAT;
		var normalize = false;
		var stride = 0;
		var offset = 0;
		gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

		var primitiveType = gl.TRIANGLES;
		var offset = 0 ;
		var count = 3;
		gl.drawArrays(primitiveType, offset, count);
	}else{
		log("Canvas is invalid");
	}
}
function createShader(gl,type,source){
	console.log(typeof(gl));
	var shader = gl.createShader(type);
	gl.shaderSource(shader,source);
	gl.compileShader(shader);
	var success = gl.getShaderParameter(shader,gl.COMPILE_STATUS);
	if(success){
		return shader;
	}
	log(gl.getShaderInfoLog(shader));
	gl.deleteShader(shader);
}

function createProgram(gl,vertexShader,fragmentShader){
	var program = gl.createProgram();
	gl.attachShader(program,vertexShader);
	gl.attachShader(program,fragmentShader);
	gl.linkProgram(program);
	var success = gl.getProgramParameter(program,gl.LINK_STATUS);
	if(success){
		return program;
	}
	log(gl.getPrograminfoLog(program));		
	gl.deleteProgram(program);
}
