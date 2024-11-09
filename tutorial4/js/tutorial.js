"use strict";
window.addEventListener("load",function(e){

	console.log("DOM Loaded");
	document.getElementById("btnCanvas").click();
	main();
});
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
function main(){
	error("Error Sample Message");
	warning("Warning Sample Message");
	log("Log Sample Message");
	info("Info Sample Message");
	success("Success Sample Message");
	var image = new Image();
	image.src = "https://www.swhistlesoft.com/demo/webgl/tutorial4/img/leaves.jpg";
	image.loaded = false;
	image.onload = function(){
		image.loaded = true;
		log("Inside Main");	
		const canvs= document.getElementById("canvs");
		canvs.width = 480;
		canvs.height = 360;
		canvs.style.width = 400;
		canvs.style.height = 360;
		if(canvs){
			success("Canvas obj is potentially valid");
			const gl = canvs.getContext("webgl");
			if(gl === null){
				console.log("Unable to initialize");
				return;
			}
			success("Gl Context Created");
			gl.clearColor(0.0,0.0,0.0,1.0);
			gl.clear(gl.COLOR_BUFFER_BIT);
	
			var vertexShaderSource = document.getElementById("vertex-shader-1").text;
			if(!vertexShaderSource){
				error("Failed to load Vertex Shader Source");
				return;
			}
			info("Vertex:"+vertexShaderSource);
			var fragmentShaderSource = document.getElementById("fragment-shader-2d").text;
			if(!fragmentShaderSource){
				error("Failed to get Fragment Shader Source");
				return ;
			}
			info("Fragment:"+fragmentShaderSource);
			var vertexShader = createShader(gl,gl.VERTEX_SHADER,vertexShaderSource);
			if(!vertexShader){
				error("Failed to create the vertex shader");
				return;
			}
			success("Vertex Shader Created");
			var fragmentShader = createShader(gl,gl.FRAGMENT_SHADER,fragmentShaderSource);
			if(!fragmentShader){
				error("Failed to create the fragment shader");
				return;
			}
			success("Fragment Shader Created");

			var program = createProgram(gl,vertexShader,fragmentShader);
			if(!program){
				error("Failed to link the program");
				return;
			}
			success("Program Linked");

			var positionLocation = gl.getAttribLocation(program, "a_position");
			var texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

			// Create a buffer to put three 2d clip space points in
			var positionBuffer = gl.createBuffer();

			// Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
			// Set a rectangle the same size as the image.
			setRectangle(gl, 0, 0, image.width, image.height);

			// provide texture coordinates for the rectangle.
			var texcoordBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
				0.0,  0.0,
				1.0,  0.0,
				0.0,  1.0,
				0.0,  1.0,
				1.0,  0.0,
				1.0,  1.0,
			]), gl.STATIC_DRAW);

			// Create a texture.
			var texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, texture);

			// Set the parameters so we can render any size image.
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

			// Upload the image into the texture.
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

			// lookup uniforms
			var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
			var textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");

			//webglUtils.resizeCanvasToDisplaySize(gl.canvas);

			// Tell WebGL how to convert from clip space to pixels
			gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

			// Clear the canvas
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);

			// Tell it to use our program (pair of shaders)
			gl.useProgram(program);

			// Turn on the position attribute
			gl.enableVertexAttribArray(positionLocation);

			// Bind the position buffer.
			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

			// Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
			var size = 2;          // 2 components per iteration
			var type = gl.FLOAT;   // the data is 32bit floats
			var normalize = false; // don't normalize the data
			var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
			var offset = 0;        // start at the beginning of the buffer
			gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

			// Turn on the texcoord attribute
			gl.enableVertexAttribArray(texcoordLocation);

			// bind the texcoord buffer.
			gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

			// Tell the texcoord attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
			var size = 2;          // 2 components per iteration
			var type = gl.FLOAT;   // the data is 32bit floats
			var normalize = false; // don't normalize the data
			var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
			var offset = 0;        // start at the beginning of the buffer
			gl.vertexAttribPointer(texcoordLocation, size, type, normalize, stride, offset);

			// set the resolution
			gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

			// set the size of the image
			gl.uniform2f(textureSizeLocation, image.width, image.height);

			// Draw the rectangle.
			var primitiveType = gl.TRIANGLES;
			var offset = 0;
			var count = 6;
			gl.drawArrays(primitiveType, offset, count);

		}else{
			error("Canvas is invalid");
		}
	}
}
function createShader(gl,type,source){
	console.log(typeof(gl));
	var shader = gl.createShader(type);
	gl.shaderSource(shader,source);
	gl.compileShader(shader);
	var succeeded = gl.getShaderParameter(shader,gl.COMPILE_STATUS);
	if(succeeded){
		success("Shader Compiled");
		return shader;
	}
	error(gl.getShaderInfoLog(shader));
	gl.deleteShader(shader);
}

function createProgram(gl,vertexShader,fragmentShader){
	var program = gl.createProgram();
	gl.attachShader(program,vertexShader);
	gl.attachShader(program,fragmentShader);
	gl.linkProgram(program);
	var succeeded = gl.getProgramParameter(program,gl.LINK_STATUS);
	if(succeeded){
		success("Program Linked");
		return program;
	}
	error(gl.getPrograminfoLog(program));		
	gl.deleteProgram(program);
}

function randomInt(range){
	return Math.floor(Math.random()*range);
}

function setRectangle(gl,x,y,width,height){
	var x1 = x;
	var x2 = x + width;
	var y1 = y;
	var y2 = y + height;
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
		x1,y1,
		x2,y1,
		x1,y2,
		x1,y2,
		x2,y1,
		x2,y2]),gl.STATIC_DRAW);
}