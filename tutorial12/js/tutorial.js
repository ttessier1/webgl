"use strict";
window.addEventListener("load",function(e){

	console.log("DOM Loaded");
	document.getElementById("btnCanvas").click();
	main();
});

async function downloadAndParseObjFile(gl,url){
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		let text = await response.text();
		const obj = ObjectParser.Parse(text);
		if(obj.length === 0 ){
			error("Length of object file is 0");
			return ;
		}
		const matTexts = await Promise.all(obj.materialLibs.map(async filename =>{
			info("Base:"+url);
			var l = new URL(url);
			var path = l.protocol + "//"+ l.host+"/"+l.pathname.substr(0,l.pathname.lastIndexOf("/")+1)+filename;
			info("Attempting to url:"+path);
			const resp = await fetch(path);
			return resp.text();
		}));
		console.log("MatTexts:"+matTexts);
		const materials = MtlParser.Parse(matTexts.join("\n"));
		const textures = {
			defaultWhite: createPixelTexture(gl,[255,255,255,255]),
			defaultNormal: createPixelTexture(gl,[127,127,255,0]),
		};
		for ( const material of Object.values(materials)){
			Object.entries(material)
			.filter(([key]) => key.endsWith("Map"))
			.forEach(([key, filename]) => {
				let texture = textures[filename];
				if(!texture){
					var l = window.location;
					const textureHref = l.protocol+"//"+l.host+"/"+l.pathname.substr(0,l.pathname.lastIndexOf("/")+1)+"obj/"+filename;
					texture  = createTexture(gl, textureHref);
					textures[filename] = texture;
				}
				material[key] = texture;
			});

		}
		return { 
			obj: obj,
			materials: materials,
			textures: textures,
		};
	}catch (err) {
		error(err.message);
	}
}

async function downloadAndParseMaterial(url){
	try{
		const response = await fetch(url);
		if(!response.ok){
			throw new Error(`Response status: ${response.status}`);
		}
		console.log(response.text);
	}catch(err){
		error(err.message);
	}
}


function setSkyboxGeometry(gl){
	var positions = new Float32Array([
		-1,-1,
		1,-1,
		-1,1,
		-1,1,
		1,-1,
		1,1
	]);
	gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}


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
		success("Canvas obj is potentially valid");

		const gl = canvs.getContext("webgl");
		if(gl === null || gl.constructor.name != "WebGLRenderingContext" ){
			error("Unable to initialize");
			return;
		}

		success("Gl Context Created:"+gl.constructor.name);
		gl.clearColor(0.0,1.0,0.0,1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		var vertexShaderEnvSource = document.getElementById("vertex-shader-env-id").text;
		if(!vertexShaderEnvSource){
			error("Failed to load vertex Shader Source");
			return;
		}
		info("VertexEnv:"+vertexShaderEnvSource+":"+vertexShaderEnvSource.constructor.name);
		var fragmentShaderEnvSource = document.getElementById("fragment-shader-env-id").text;
		if(!fragmentShaderEnvSource){
			error("Failed to load fragment Shader Source");
			return;
		}
		info("FragmentEnv:"+fragmentShaderEnvSource+":"+fragmentShaderEnvSource.constructor.name);
		var vertexEnvShader = webglUtils.createShader(gl,gl.VERTEX_SHADER,vertexShaderEnvSource);
		if(!vertexEnvShader){
			error("Failed to create the vertex shader");
			return;
		}
		if(vertexEnvShader.constructor.name != "WebGLShader"){
			error("Vertex Env Shader not WebGLShader:"+vertexEnvShader.constructor.name);	
			return;
		}
		var fragmentEnvShader = webglUtils.createShader(gl,gl.FRAGMENT_SHADER,fragmentShaderEnvSource);
		if(!fragmentEnvShader){
			error("Failed to create the fragment shader");
			return;
		}
		if(fragmentEnvShader.constructor.name != "WebGLShader"){
			error("Fragment Env Shader not WebGLShader:"+fragmentEnvShader.constructor.name);
			return;
		}

		var programEnv = webglUtils.createProgram(gl,vertexEnvShader,fragmentEnvShader);
		if(!programEnv){
			error("Failed to link the program");
			return;
		}
		if(programEnv.constructor.name != "WebGLProgram"){
			error("Link Program is not WebGLProgram:"+programEnv.constructor.name);
			return;
		}
		success("Program Linked:"+programEnv.constructor.name);

		/*var programInfoEnv = {
			program:programEnv,
			uniformSetters:createUniformSetters(gl,programEnv),
			attribSetters:createAttributeSetters(gl,programEnv),
		};*/

		var positionLocation = gl.getAttribLocation(programEnv,
"a_position");
		var normalLocation = gl.getAttribLocation(programEnv,"a_normal");

		var projectionLocation = gl.getUniformLocation(programEnv,"u_projection");
		var viewLocation = gl.getUniformLocation(programEnv,"u_view");
		var worldLocation = gl.getUniformLocation(programEnv,"u_world");
		var textureLocation = gl.getUniformLocation(programEnv,"u_texture");
		var worldCameraPositionLocation = gl.getUniformLocation(programEnv,"u_worldCameraPosition");

		var positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);

		setGeometry(gl);

		var normalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffer);

		setNormals(gl);
		
		webglUtils.firstLoop = true;

		var texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_CUBE_MAP,texture);

		const faceInfos= [
		{
			target:gl.TEXTURE_CUBE_MAP_POSITIVE_X,
			url: 'img/pos-x.jpg',
		},
		{
			target:gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
			url: 'img/neg-x.jpg',
		},
		{
			target:gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
			url:'img/pos-y.jpg',
		},
		{
			target:gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
			url:'img/neg-y.jpg',
		},
		{
			target:gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
			url:'img/pos-z.jpg',
		},
		{
			target:gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
			url:'img/neg-z.jpg',
		}];

		faceInfos.forEach((faceInfo) =>{
			const {target,url} = faceInfo;
			const level = 0 ;

			const internalFormat = gl.RGBA;
			const width = 512;
			const height = 512;
			const format = gl.RGBA;
			const type = gl.UNSIGNED_BYTE;

			gl.texImage2D(target,level,internalFormat,width,height,0,format,type,null);

			const image = new Image();
			image.src = url;
			image.addEventListener('load',function(){
				gl.bindTexture(gl.TEXTURE_CUBE_MAP,texture);
				gl.texImage2D(target,level,internalFormat,format,type,image);
				gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
			});
		});

		gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
		
		var fieldOfViewRadians = webglUtils.degToRad(60);
		var modelXRotationRadians = webglUtils.degToRad(0);
		var modelYRotationRadians = webglUtils.degToRad(0);
		var cameraYRotationRadians = webglUtils.degToRad(0);

		var spinCamera = true;
		var then = 0;

		window.firstLoop = true;
		window.continueLoop = true;

		function render(time){
			
			time *= 0.001;
			var deltaTime = time - then;
			then = time;
			gl.viewport(0,0,gl.canvas.width,gl.canvas.height);

			gl.enable(gl.CULL_FACE);
			gl.enable(gl.DEPTH_TEST);

			gl.clearColor(0,0,0,1);
			gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

			modelYRotationRadians += -0.7 * deltaTime;
			modelXRotationRadians += -0.4 * deltaTime;

			gl.useProgram(programEnv);

			gl.enableVertexAttribArray(positionLocation);
			gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);

			var size = 3;
			var type = gl.FLOAT;
			var normalize = false;
			var stride= 0 ;
			var offset = 0 ;
			gl.vertexAttribPointer(positionLocation,size,type,normalize,stride,offset);
			gl.enableVertexAttribArray(normalLocation);

			gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

			var size = 3;
			var type = gl.FLOAT;
			var normalize = false;
			var stride = 0;
			var offset = 0;
			gl.vertexAttribPointer(normalLocation, size, type, normalize, stride, offset);
	
			const aspect = gl.canvas.clientWidth/gl.canvas.clientHeight;
			if ( window.firstLoop )info("Aspect:"+aspect);

			const projectionMatrix = m4.perspective(fieldOfViewRadians,aspect,1,2000);
			if ( window.firstLoop )info("Projection:"+projectionMatrix);

			const cameraPosition = [0,0,2];
			if(window.firstLoop)info("CameraPosition:"+cameraPosition);

			const cameraTarget = [0,0,0];
			if(window.firstLoop)info("CameraTarget:"+cameraTarget);

			const up = [0,1,0];
			if ( window.firstLoop )info("Up:"+up);

			const cameraMatrix = m4.lookAt(cameraPosition,cameraTarget,up);
			if ( window.firstLoop )info("Camera:"+cameraMatrix);

			const viewMatrix = m4.inverse(cameraMatrix);
			if ( window.firstLoop )info("View:"+viewMatrix);

			var worldMatrix = m4.xRotation(modelXRotationRadians);
			worldMatrix = m4.yRotate(worldMatrix,modelYRotationRadians);
			if(window.firstLoop)info("World Matrix:"+worldMatrix);

			gl.uniformMatrix4fv(projectionLocation,false,projectionMatrix);
			gl.uniformMatrix4fv(viewLocation,false,viewMatrix);
			gl.uniformMatrix4fv(worldLocation, false, worldMatrix);
			gl.uniform3fv(worldCameraPositionLocation,cameraPosition);

			gl.uniform1i(textureLocation,0);
			gl.drawArrays(gl.TRIANGLES,0,6*6);


			window.firstLoop = false;
			webglUtils.firstLoop = false;
			if(window.continueLoop){
				requestAnimationFrame(render);
			}
		}
		requestAnimationFrame(render);
	}else{
		error("Canvas is invalid");
	}
}


function setGeometry(gl){
	var positions = new Float32Array([
		-0.5, -0.5, -0.5,
		-0.5,  0.5, -0.5,
		 0.5, -0.5, -0.5,
		-0.5,  0.5, -0.5,
		 0.5,  0.5, -0.5,
		 0.5, -0.5, -0.5,

		-0.5, -0.5,  0.5,
		 0.5, -0.5,  0.5,
		-0.5,  0.5,  0.5,
		-0.5,  0.5,  0.5,
		 0.5, -0.5,  0.5,
		 0.5,  0.5,  0.5,

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
		 0.5,  0.5,  0.5,
	]);
	gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

function setNormals(gl){
	var normals= new Float32Array([
		0,0,-1,
		0,0,-1,
		0,0,-1,
		0,0,-1,
		0,0,-1,
		0,0,-1,

		0,0,1,
		0,0,1,
		0,0,1,
		0,0,1,
		0,0,1,
		0,0,1,

		0,1,0,
		0,1,0,
		0,1,0,
		0,1,0,
		0,1,0,
		0,1,0,

		0,-1,0,
		0,-1,0,
		0,-1,0,
		0,-1,0,
		0,-1,0,
		0,-1,0,

		-1,0,0,
		-1,0,0,
		-1,0,0,
		-1,0,0,
		-1,0,0,
		-1,0,0,

		1,0,0,
		1,0,0,
		1,0,0,
		1,0,0,
		1,0,0,
		1,0,0,
	]);
	gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
}
