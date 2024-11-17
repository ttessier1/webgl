"use strict";
window.addEventListener("load",function(e){

	console.log("DOM Loaded");
	document.getElementById("btnCanvas").click();
	main();
});


function main(){
	error("Error Sample Message");
	warning("Warning Sample Message");
	log("Log Sample Message");
	info("Info Sample Message");
	success("Success Sample Message");
	log("Inside Main");	
	const canvs= document.getElementById("canvs");
	canvs.width = 480;
	canvs.height = 360;
	canvs.style.width = 400;
	canvs.style.height = 360;
	if(canvs){

		const gl = canvs.getContext("webgl");
		if(gl === null || gl.constructor.name != "WebGLRenderingContext" ){
			error("Unable to initialize");
			return;
		}

		success("Gl Context Created:"+gl.constructor.name);
		gl.clearColor(0.0,1.0,0.0,1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		var vertexShaderSkySource = document.getElementById("vertex-shader-sky-id").text;
		if(!vertexShaderSkySource){
			error("Failed to load Vertex Shader Source");
			return;
		}
		info("Vertex:"+vertexShaderSkySource+":"+vertexShaderSkySource.constructor.name);
		var fragmentShaderSkySource = document.getElementById("fragment-shader-sky-id").text;
		if(!fragmentShaderSkySource){
			error("Failed to get Fragment Shader Source");
			return ;
		}
		info("Fragment:"+fragmentShaderSkySource+":"+vertexShaderSkySource.constructor.name);
		var vertexSkyShader = webglUtils.createShader(gl,gl.VERTEX_SHADER,vertexShaderSkySource);
		if(!vertexSkyShader){
			error("Failed to create the vertex shader");
			return;
		}
		if(vertexSkyShader.constructor.name != "WebGLShader"){
			error("Vertex Shader not WebGLShader:"+vertexSkyShader.constructor.name);	
			return;
		}
		success("Vertex Shader Created:"+vertexSkyShader.constructor.name);
		var fragmentSkyShader = webglUtils.createShader(gl,gl.FRAGMENT_SHADER,fragmentShaderSkySource);
		if(!fragmentSkyShader){
			error("Failed to create the fragment shader");
			return;
		}
		if(fragmentSkyShader.constructor.name != "WebGLShader"){
			error("Fragment Shader not WebGLShader:"+fragmentSkyShader.constructor.name);
			return;
		}
		success("Fragment Shader Created:"+fragmentSkyShader.constructor.name);

		var programSky = webglUtils.createProgram(gl,vertexSkyShader,fragmentSkyShader);
		if(!programSky){
			error("Failed to link the program");
			return;
		}
		if(programSky.constructor.name != "WebGLProgram"){
			error("Link Program is not WebGLProgram:"+programSky.constructor.name);
			return;
		}
		success("Program Linked:"+programSky.constructor.name);

		webglUtils.firstLoop = true;

		var positionLocation = gl.getAttribLocation(programSky, "a_position");

		var matrixLocation = gl.getUniformLocation(programSky,  "u_matrix");

		var textureLocation = gl.getUniformLocation(programSky, "u_texture");

		var positionBuffer = gl.createBuffer();
		if(positionBuffer.constructor.name != "WebGLBuffer"){
			error("Position Buffer is invalid");
			return false;
		}
		console.log("PositionBuffer: "+positionBuffer.constructor.name);

		gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);

		setGeometry(gl);

		var texture = gl.createTexture();
		if(texture.constructor.name != "WebGLTexture"){
			error("Texture is invalid");
			return false;
		}
		success("Texture:"+texture.constructor.name);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP,texture);

		const ctx = document.createElement("canvas").getContext("2d");
		if(!ctx){
			error("Canvas 2D Context is invalid");
			return false;
		}
		if(ctx.constructor.name!="CanvasRenderingContext2D"){
			error("Canvas2D is not CanvasRenderingContext2D"); 
			return false;
		}
		success("Ctx:"+ctx.constructor.name);

		ctx.canvas.width = 128;
		ctx.canvas.height = 128;

		const faceInfos =[
			{ target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, faceColor: '#F00', textColor: '#0FF', text: '+x'},
			{ target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, faceColor: '#FF0', textColor: '#00F', text: '-x'},
			{ target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, faceColor: '#0F0', textColor: '#F0F', text: '+y'},
			{ target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, faceColor: '#0FF', textColor: '#F00', text: '-y'},
			{ target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, faceColor: '#00F', textColor: '#FF0', text: '+z'},
			{ target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, faceColor: '#F0F', textColor: '#0F0', text: '-z'},
		];
		faceInfos.forEach((faceInfo) => {
			const { target, faceColor, textColor, text} = faceInfo;
			console.log("Target:"+target);
			console.log("FaceColor:"+faceColor);
			console.log("TexColor:"+textColor);
			console.log("Text:"+text);
			generateFace(ctx,faceColor,textColor,text);
			const level = 0;
			const internalFormat = gl.RGBA;
			const format = gl.RGBA;
			const type = gl.UNSIGNED_BYTE;
			gl.texImage2D(target,level,internalFormat,format,type,ctx.canvas);
		});

		gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);

		var fieldOfViewRadians = webglUtils.degToRad(60);
		var modelXRotationRadians = webglUtils.degToRad(0);
		var modelYRotationRadians = webglUtils.degToRad(0);

		var then = 0 ;

		window.firstLoop = true;
		window.continueLoop = true;

		function render(time){
			
			time *= 0.001;
			var deltaTime = time - then;
			var randomColor1 = (time%20)/20;
			var randomColor2 = 1-((time%20)/20);
			var randomColor3 = ((time%20)/20)>.5?((time%20)/20)-.5:((time%20)/20)+.5;
			
			then = time;
			gl.viewport(0,0,gl.canvas.width,gl.canvas.height);

			gl.enable(gl.CULL_FACE);
			gl.enable(gl.DEPTH_TEST);

			gl.depthFunc(gl.LEQUAL); // Near things obscure far things

			gl.clearColor(randomColor1,randomColor2,randomColor3,1);
			//console.log("Color:"+randomColor1+" "+randomColor2+" "+randomColor3);
			gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

			modelYRotationRadians += -0.7* deltaTime;
			modelXRotationRadians += -0.4 * deltaTime;

			gl.useProgram(programSky);

			gl.enableVertexAttribArray(positionLocation);

			gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);

			var size = 3;
			var type = gl.FLOAT;
			var normalize = false;
			var stride = 0;
			var offset = 0;
			gl.vertexAttribPointer(positionLocation,size,type,normalize,stride,offset);

			const aspect = gl.canvas.clientWidth/gl.canvas.clientHeight;
			if ( window.firstLoop )info("Aspect:"+aspect);

			const projectionMatrix = m4.perspective(fieldOfViewRadians,aspect,1,2000);
			if ( window.firstLoop )info("Projection:"+projectionMatrix);

			const cameraPosition = [0,0,2];
			if(window.firstLoop)info("CameraPosition:"+cameraPosition);

			const up = [0,1,0];
			if ( window.firstLoop )info("Up:"+up);

			const cameraTarget = [0,0,0];
			if(window.firstLoop)info("CameraTarget:"+cameraTarget);

			const cameraMatrix = m4.lookAt(cameraPosition,cameraTarget,up);
			if ( window.firstLoop )info("Camera:"+cameraMatrix);

			const viewMatrix = m4.inverse(cameraMatrix);
			if ( window.firstLoop )info("View:"+viewMatrix);

			var viewProjectionMatrix = m4.multiply(projectionMatrix,viewMatrix);

			var matrix = m4.xRotate(viewProjectionMatrix,modelXRotationRadians);
			matrix = m4.yRotate(matrix,modelYRotationRadians);

			if(window.firstLoop)info("Matrix:"+matrix);

			gl.uniformMatrix4fv(matrixLocation,false,matrix);

			gl.uniform1i(textureLocation,0);

			gl.drawArrays(gl.TRIANGLES,0,6*6);

			window.firstLoop = false;
			webglUtils.firstLoop = false;
				requestAnimationFrame(render);
		}
		requestAnimationFrame(render);
	}else{
		error("Canvas is invalid");
	}
}


function generateFace(ctx,faceColor,textColor,text){
	const {width,height} = ctx.canvas;
	ctx.fillStyle = faceColor;
	ctx.fillRect(0,0,width,height);
	ctx.font = `${width*0.7}px sans-serif`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = textColor;
	ctx.fillText(text,width/2,height/2);
	var img    = ctx.canvas.toDataURL();
	var uiContainer = document.getElementById("uiContainer");
	var imgElement= document.createElement("img");
	imgElement.src = img;
	var imgValue = new Image();
	imgValue.src = img;
	uiContainer.append(imgElement);
	return imgValue;
}

function setGeometry(gl){
	var positions = new Float32Array([
		-0.5, -0.5, -0.5,
		-0.5,  0.5, -0.5,
		 0.5, -0.5, -0.5,
		-0.5,  0.5, -0.5,
		 0.5,  0.5, -0.5,
		 0.5, -0.5, -0.5,

		-0.5, -0.5, 0.5,
		 0.5, -0.5, 0.5,
		-0.5,  0.5, 0.5,
		-0.5,  0.5, 0.5,
		 0.5, -0.5, 0.5,
                 0.5,  0.5, 0.5,

		-0.5,  0.5, -0.5,
		-0.5,  0.5,  0.5,
		 0.5,  0.5, -0.5,
		-0.5,  0.5,  0.5,
		 0.5,  0.5,  0.5,
		 0.5,  0.5, -0.5,

		-0.5, -0.5, -0.5,
		 0.5, -0.5, -0.5,
		-0.5, -0.5,  0.5,
		-0.5, -0.5,  0.5,
		 0.5, -0.5, -0.5,
		 0.5, -0.5,  0.5,

		-0.5, -0.5, -0.5,
		-0.5, -0.5,  0.5,
		-0.5,  0.5, -0.5,
		-0.5, -0.5,  0.5,
		-0.5,  0.5,  0.5,
		-0.5,  0.5, -0.5,

		0.5, -0.5, -0.5,
		0.5,  0.5, -0.5,
		0.5, -0.5,  0.5,
		0.5, -0.5,  0.5,
		0.5,  0.5, -0.5,
		0.5,  0.5,  0.5
	]);
	console.log("Positions:"+positions+ ":"+positions.length);
	gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}
