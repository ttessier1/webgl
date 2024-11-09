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
			var fragmentShaderSource = document.getElementById("fragment-shader-kernel").text;
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
			render(gl,program,image);

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

function computeKernelWeight(kernel){
	var weight  = kernel.reduce(function(prev,curr){
		return prev + curr;
	});
	return weight <= 0 ? 1 : weight;
}

function drawWithKernel(gl,program,image,name){
	gl.viewport(0,0,gl.canvas.width, gl.canvas.height);
	gl.clearColor(0,0,0,0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.useProgram(program);
	gl.enableVertexAttribArray(WebGlParameters.positionLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, WebGlParameters.positionBuffer);
	
	var size = 2;
	var type = gl.FLOAT;
	var normalize = false;
	var stride = 0 ;
	var offset = 0 ;
	gl.vertexAttribPointer(WebGlParameters.positionLocation,size,type,normalize,stride,offset);

	gl.enableVertexAttribArray(WebGlParameters.texcoordLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER,WebGlParameters.texcoordBuffer);
	
	var size = 2;
	var type = gl.FLOAT;
	var normalize = false;
	var stride = 0 ;
	var offset = 0 ;
	gl.vertexAttribPointer(WebGlParameters.texcoordLocation,size,type,normalize,stride,offset);

	gl.uniform2f(WebGlParameters.resolutionLocation, gl.canvas.width, gl.canvas.height);

	gl.uniform2f(WebGlParameters.textureSizeLocation, image.width, image.height);
	
	log("Updating Kernel with:["+name+"]");

	gl.uniform1fv(WebGlParameters.kernelLocation, WebGlParameters.kernels[name]);

	gl.uniform1f(WebGlParameters.kernelWeightLocation, computeKernelWeight(WebGlParameters.kernels[name]));

	var primitiveType = gl.TRIANGLES;
	var offset = 0 ;
	var count = 6;
	gl.drawArrays(primitiveType, offset, count);
}

window.WebGlParameters = (function(){
	return {
		positionLocation:null,
		texcoordLocation:null,
		resolutionLocation:null,
		textureSizeLocation:null,
		kernelLocation:null,
		kernelWeightLocation:null,
		positionBuffer:null,
		texcoordBuffer:null,
		kernels:null,
	};
}());

function render(gl,program,image){
	WebGlParameters.positionLocation = gl.getAttribLocation(program, "a_position");
	WebGlParameters.texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

	// Create a buffer to put three 2d clip space points in
	WebGlParameters.positionBuffer = gl.createBuffer();

	// Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
	gl.bindBuffer(gl.ARRAY_BUFFER, WebGlParameters.positionBuffer);
	// Set a rectangle the same size as the image.
	setRectangle(gl, 0, 0, image.width, image.height);

	// provide texture coordinates for the rectangle.
	WebGlParameters.texcoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, WebGlParameters.texcoordBuffer);
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
	WebGlParameters.resolutionLocation = gl.getUniformLocation(program, "u_resolution");
	WebGlParameters.textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");
	WebGlParameters.kernelLocation = gl.getUniformLocation(program, "u_kernel[0]");
	WebGlParameters.kernelWeightLocation = gl.getUniformLocation(program, "u_kernelWeight");

	WebGlParameters.kernels = {
		normal:[
			0,0,0,
			0,1,0,
			0,0,0,
		],
		gaussianBlur:[
			0.045,0.122,0.045,
			0.122,0.322,0.122,
			0.045,0.122,0.045,
		],
		gaussianBlur2:[
			1,2,1,
			2,4,2,
			1,2,1
		],
		gaussianBlur3:[
			0,1,0,
			1,1,1,
			0,1,0,
		],
		unsharpen:[
			-1,-1,-1,
			-1,9,-1,
			-1,-1,-1,
		],
		sharpness: [
			0,-1,0,
			-1,5,-1,
			0,-1,0,
		],
		sharpen:[
			-1,-1,-1,
			-1,16,-1,
			-1,-1,-1,
		],
		edgeDetect:[
			-0.125,-0.125,-0.125,
			-0.125,1,-0.125,
			-0.125,-0.125,-0.125,
		],
		edgeDetect2:[
			-1,-1,-1,
			-1,8,-1,
			-1,-1,-1,
		],
		edgeDetect3:[
			-5,0,0,
			0,0,0,
			0,0,5,
		],
		edgeDetect4:[
			-1,-1,-1,
			0,0,0,
			1,1,1,
		],
		edgeDetect5:[
			-1,-1,-1,
			2,2,2,
			-1,-1,-1,
		],
		edgeDetect6:[
			-5,-5,-5,
			-5,39,-5,
			-1,-2,-1,
		],
		sobelHorizontal:[
			1,2,1,
			0,0,0,
			-1,-2,-1,
		],
		sobelVertical:[
			1,0,-1,
			2,0,-2,
			1,0,-1,
		],
		previtHorizontal:[
			1,1,1,
			0,0,0,
			-1,-1,-1,
		],
		previtVertical:[
			1,0,-1,
			1,0,-1,
			1,0,-1,
		],
		boxBlur:[
			0.111,0.111,0.111,
			0.111,0.111,0.111,
			0.111,0.111,0.111,
		],
		triangleBlur:[
			0.0625, 0.125, 0.0625,
			0.125,0.25,0.125,
			0.0625,0.125,0.0625,
		],
		emboss:[
			-2,-1,0,
			-1,1,1,
			0,1,2,
		]
	};

	var initialSelection = "normal";

	var ui = document.querySelector("#ui");
	var select = document.createElement("select");
	for ( var name in WebGlParameters.kernels){
		var option = document.createElement("option");
		option.value = name;
		if(name === initialSelection){
			option.selected = true;
		}
		option.appendChild(document.createTextNode(name));
		select.appendChild(option);
	}
	select.onchange = function(event){
		log("On Change:"+this.options[this.selectedIndex].value);
		if(WebGlParameters.kernels.hasOwnProperty(this.options[this.selectedIndex].value)){
			info("Kernel Parameters:"+WebGlParameters.kernels[this.options[this.selectedIndex].value]);
			drawWithKernel(gl,program,image,this.options[this.selectedIndex].value);
		}else{
			error("The kernel does not exist:"+this.options[this.selectedIndex].value);
		}
	}
	ui.appendChild(select);
	drawWithKernel(gl,program,image,initialSelection);
}
