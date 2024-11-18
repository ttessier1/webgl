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

		var programInfoEnv = {
			program:programEnv,
			uniformSetters:createUniformSetters(gl,programEnv),
			attribSetters:createAttributeSetters(gl,programEnv),
		};

		if ( programInfoEnv.program.constructor.name != "WebGLProgram"){
			error("program not set up in programInfoEnv:"+programInfoEnv.program.constructor.name);
			return;
		}
		if ( programInfoEnv.uniformSetters.constructor.name != "Object"){
			error("Uniform Setters not set up in programInfoEnv:"+programInfoEnv.uniformSetters.constructor.name);
			return;
		}
		if ( programInfoEnv.attribSetters.constructor.name != "Object"){
			error("Attrib Setters not set up in programInfoEnv:"+programInfoEnv.attribSetters.constructor.name);
			return;
		}

		var programInfoSky ={
			program:programSky,
			uniformSetters:createUniformSetters(gl,programSky),
			attribSetters:createAttributeSetters(gl,programSky),
		};
		if ( programInfoSky.program.constructor.name != "WebGLProgram"){
			error("program not set up in programInfoSky:"+programInfoSky.program.constructor.name);
			return;
		}
		if ( programInfoSky.uniformSetters.constructor.name != "Object"){
			error("Uniform Setters not set up in programInfoSky:"+programInfoSky.uniformSetters.constructor.name);
			return;
		}
		if ( programInfoSky.attribSetters.constructor.name != "Object"){
			error("Attrib Setters not set up in programInfoSky:"+programInfoSky.attribSetters.constructor.name);
			return;
		}

		webglUtils.firstLoop = true;

		const cubeBufferInfo = primitives.createCubeBufferInfo(gl,1);
		info("CubeBufferInfo:"+cubeBufferInfo);
		console.log("CubeBufferInfo:",cubeBufferInfo);
		const quadBufferInfo= primitives.createXYQuadBufferInfo(gl);
		info("QuadBufferInfo:"+quadBufferInfo);
		console.log("QuadBufferInfo",quadBufferInfo);

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
		var cameraAngleRadians = webglUtils.degToRad(0);

		var spinCamera = true;
		var then = 0;

		window.firstLoop = true;
		window.continueLoop = true;

		function render(time){
			
			time *= 0.005;
			var deltaTime = time - then;
			then = time;
			gl.viewport(0,0,gl.canvas.width,gl.canvas.height);

			gl.enable(gl.CULL_FACE);
			gl.enable(gl.DEPTH_TEST);

			gl.clearColor((time%10/10),1-((time%7)/7),((time%14)/14),1);
			gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

			const aspect = gl.canvas.clientWidth/gl.canvas.clientHeight;
			if ( window.firstLoop )info("Aspect:"+aspect);

			const projectionMatrix = m4.perspective(fieldOfViewRadians,aspect,1,2000);
			if ( window.firstLoop )info("Projection:"+projectionMatrix);

			const cameraPosition = [Math.cos(time*.1)*3,0,Math.sin(time*.1)*3];
			if(window.firstLoop)info("CameraPosition:"+cameraPosition);

			const cameraTarget = [0,0,0];
			if(window.firstLoop)info("CameraTarget:"+cameraTarget);

			const up = [0,1,0];
			if ( window.firstLoop )info("Up:"+up);

			const cameraMatrix = m4.lookAt(cameraPosition,cameraTarget,up);
			if ( window.firstLoop )info("Camera:"+cameraMatrix);

			const viewMatrix = m4.inverse(cameraMatrix);
			if ( window.firstLoop )info("View:"+viewMatrix);

			//var worldMatrix = m4.xRotation(time * 0.11);
			var worldMatrix = m4.xRotation(time * 0.11);
			if(window.firstLoop)info("World Matrix:"+worldMatrix);


			const viewDirectionMatrix = m4.copy(viewMatrix);

			//viewMatrix[12] = 0 ;
			//viewMatrix[13] = 0 ;
			//viewMatrix[14] = 0 ;

			var viewDirectionProjectionMatrix =
				 m4.multiply(projectionMatrix,viewDirectionMatrix);
			if(window.firstLoop)info("viewDirectionProjectionMatrix:"+viewDirectionProjectionMatrix);
			var viewDirectionProjectionInverseMatrix = 
				m4.inverse(viewDirectionProjectionMatrix);
			if(window.firstLoop)info("viewDirectionProjectionInverseMatrix:"+viewDirectionProjectionInverseMatrix);

			//gl.depthFunc(gl.LESS);

			gl.useProgram(programInfoEnv.program);	

			// dont need texture coordinates
			delete cubeBufferInfo.attribs.a_texcoord ;

			webglUtils.setBuffersAndAttributes(gl,programInfoEnv,cubeBufferInfo);

			webglUtils.setUniforms(programInfoEnv,{
				u_world: worldMatrix,
				u_view: viewMatrix,
				u_projection: projectionMatrix,
				u_texture: texture,
				u_worldCameraPosition: cameraPosition,
			});

			if(window.firstLoop) console.log(cubeBufferInfo);
			webglUtils.drawBufferInfo(gl,cubeBufferInfo,gl.TRIANGLES,36,0);

			gl.depthFunc(gl.LEQUAL);

			gl.useProgram(programInfoSky.program);

			webglUtils.setBuffersAndAttributes(gl,programInfoSky,quadBufferInfo);
			webglUtils.setUniforms(programInfoSky,{
				u_viewDirectionProjectionInverse: viewDirectionProjectionInverseMatrix,
				u_skybox: texture,

			});
			webglUtils.drawBufferInfo(gl,quadBufferInfo);

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
