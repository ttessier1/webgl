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
	canvs.width = 400;
	canvs.height = 300;
	canvs.style.width = 400;
	canvs.style.height = 300;
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
		var resolutionUniformLocation = gl.getUniformLocation(program,"u_resolution");
		var colorUniformLocation = gl.getUniformLocation(program,"u_color");
		var positionBuffer = gl.createBuffer();

		gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);

		var positions= [
			10,20,
			80,20,
			10,30,
			10,30,
			80,20,
			80,30,

		];
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions),gl.STATIC_DRAW);
		//webglUtils.resizeCanvasToDisplaySize(gl.canvas);
		gl.viewport(0,0,gl.canvas.width,gl.canvas.height);
		
		gl.clearColor(0,0,0,0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(program);

		gl.enableVertexAttribArray(positionAttributeLocation);

		gl.uniform2f(resolutionUniformLocation, gl.canvas.width,gl.canvas.height);
		
		gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
		var size= 2;
		var type= gl.FLOAT;
		var normalize = false;
		var stride = 0;
		var offset = 0;
		gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

		var primitiveType = gl.TRIANGLES;
		var offset = 0 ;
		var count = 6;
		//gl.drawArrays(primitiveType, offset, count);
		for ( var ii = 0 ; ii < 50 ; ++ii){
			setRectangle(gl, randomInt(300),randomInt(300),randomInt(300),randomInt(300));
			gl.uniform4f(colorUniformLocation,Math.random(),Math.random(),Math.random(),1);
			gl.drawArrays(gl.TRIANGLES,0,6);
		}
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

function randomInt(range){
	return Math.floor(Math.random()*range);
}

function setRectangle(gl,x,y,width,height){
	var x1 = x;
	var y1 = y;
	var x2 = x + width;
	var y2 = y + height;

	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
		x1,y1,
		x2,y1,
		x1,y2,
		x1,y2,
		x2,y1,
		x2,y2]),gl.STATIC_DRAW);
}
