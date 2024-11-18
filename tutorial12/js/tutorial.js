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
		let l = window.location;
		let url = l.protocol + "//"+l.host+"/";
		if(l.pathname.endsWith("/")){
			url += l.pathname;	
		}else if ( l.pathname.endsWith("index.php")){
			url += l.pathname.substr(0,l.pathname.length - 9);
		}else{
			error("Url not understood:"+url);
			return;
		}
		url += "obj/windmill.obj";
		info("Url:"+url);

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

		var skyboxLocation = gl.getUniformLocation(programSky,"u_skybox");
		var viewDirectionProjectionInverseLocation = gl.getUniformLocation(programSky,"u_viewDirectionProjectionInverse");


		var positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
		setSkyboxGeometry(gl);

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
		
		var cameraAngleRadians = webglUtils.degToRad(0);
		var fieldOfViewRadians = webglUtils.degToRad(60);

		var spinCamera = true;
		var then = 0;

		var cameraHeight = 50;


		window.firstLoop = true;
		window.continueLoop = true;

		function render(time){
			
			time *= 0.001;
			var deltaTime = time - then;
			then = time;
			gl.viewport(0,0,gl.canvas.width,gl.canvas.height);

			gl.enable(gl.DEPTH_TEST);
			gl.enable(gl.CULL_FACE);

			gl.clearColor(0,0,0,1);
			gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

			gl.useProgram(programSky);

			gl.enableVertexAttribArray(positionLocation);

			gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);

			var size = 2;
			var type = gl.FLOAT;
			var normalize = false;
			var stride = 0;
			var offset = 0;
			gl.vertexAttribPointer(positionLocation,size,type,normalize,stride,offset);
	

			const aspect = gl.canvas.clientWidth/gl.canvas.clientHeight;
			if ( window.firstLoop )info("Aspect:"+aspect);

			const projectionMatrix = m4.perspective(fieldOfViewRadians,aspect,1,2000);
			if ( window.firstLoop )info("Projection:"+projectionMatrix);

			const cameraPosition = [Math.cos(time*.1),0,Math.sin(time*.1)];
			if(window.firstLoop)info("CameraPosition:"+cameraPosition);

			const cameraTarget = [0,0,0];
			if(window.firstLoop)info("CameraTarget:"+cameraTarget);

			const up = [0,1,0];
			if ( window.firstLoop )info("Up:"+up);

			const cameraMatrix = m4.lookAt(cameraPosition,cameraTarget,up);
			if ( window.firstLoop )info("Camera:"+cameraMatrix);

			const viewMatrix = m4.inverse(cameraMatrix);
			if ( window.firstLoop )info("View:"+viewMatrix);

			viewMatrix[12] = 0 ;
			viewMatrix[13] = 0 ;
			viewMatrix[14] = 0 ;

			var viewDirectionProjectionMatrix = m4.multiply(projectionMatrix,viewMatrix);
			if(window.firstLoop)info("viewDirectionProjectionMatrix:"+viewDirectionProjectionMatrix);
			var viewDirectionProjectionInverseMatrix = m4.inverse(viewDirectionProjectionMatrix);
			if(window.firstLoop)info("viewDirectionProjectionInverseMatrix:"+viewDirectionProjectionInverseMatrix);

			gl.uniformMatrix4fv(
				viewDirectionProjectionInverseLocation,
				false,
				viewDirectionProjectionInverseMatrix);

			gl.uniform1i(skyboxLocation,0);

			gl.depthFunc(gl.LEQUAL);

			gl.drawArrays(gl.TRIANGLES,0,1*6);

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
