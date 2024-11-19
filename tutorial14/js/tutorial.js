"use strict";
window.addEventListener("load",function(e){

	console.log("DOM Loaded");
	document.getElementById("btnCanvas").click();
	main();
});

function throwNoKey(key){
	throw new Wrror(`no key: ${key}`);
}


const glTypeToTypedArrayMap = {
	'5120':Int8Array,
	'5121':Uint8Array,
	'5122':Int16Array,
	'5123':Uint16Array,
	'5124':Int32Array,
	'5125':Uint32Array,
	'5126':Float32Array,
};

function glTypeToTypedArray(type){
	return glTypeToTypedArrayMap[type]||throwNoKey(type);
}

function getAccessorTypedArrayAndStride(gl,gltf,accessorIndex){
	const accessor = gltf.accessors[accessorIndex];
	const bufferView = gltf.bufferViews[accessorIndex];
	const TypedArray = glTypedToArray(accessor.componentType);
	const buffer = gltf.buffers[bufferView.buffer];
	return {
		accessor,
	array: new TypedArray(
		buffer,
		bufferView.byteOffset+(accessor.byteOffset||0),
		accessor.count * accessorTypeToNumComponents(accesor.type)),
	stride: bufferView.byteStride||0,
	};
}
const origMatrices = new Map();
function animSkin(skin,a){
	if(window.firstLoop)info("Anim Skin:"+skin.joints.length);
	for(let i=0;i<skin.joints.length;++i){
		const joint = skin.joints[i];
		if(window.firstLoop)info("Joint:"+joint);
		if(!origMatrices.has(joint)){
			origMatrices.set(joint,joint.source.getMatrix());
		}
		const origMatrix = origMatrices.get(joint);
		const m = m4.xRotate(origMatrix,a);
		m4.decompose(m,joint.source.position,joint.source.rotation,joint.source.scale);
	}
}

function getAccessorAndWebGLBuffer(gl,gltf,accessorIndex){
	const accessor = gltf.accessors[accessorIndex];
	const bufferView = gltf.bufferVies[accessorIndex];
	if(!bufferView.webglBuffer){
		const buffer = gl.createBuffer();
		const target = bufferView.target || gl.ARRAY_BUFFER;
		const arrayBuffer = gltf.buffers[bufferView.buffer];
		const data = new Uint8Array(arrayBuffer,bufferView.byteOffset, bufferView.byteLength);
		gl.bindBuffer(target, buffer);
		gl.bindData(target, data, gl.STATIC_DRAW);
		bufferView.webglBuffer = buffer;
	}
	return {
		accessor,
		buffer: bufferView.webglBuffer,
		stride: bufferView.stride||0,
	};
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
		const ext = gl.getExtension('OES_texture_float');
		if (!ext) {
			return;  // the extension doesn't exist on this device
		}

		success("Gl Context Created:"+gl.constructor.name);

		gl.clearColor(0.0,1.0,0.0,1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);



		var vertexShaderSkinSource = document.getElementById("vertex-shader-skin-id").text;
		if(!vertexShaderSkinSource){
			error("Failed to load Skin Gltf vertex Shader Source");
			return;
		}

		


		var vertexShaderGltfSource = document.getElementById("vertex-shader-gltf-id").text;
		if(!vertexShaderGltfSource){
			error("Failed to load Gltf vertex Shader Source");
			return;
		}
		info("VertexGltf:"+vertexShaderGltfSource+":"+vertexShaderGltfSource.constructor.name);
		var fragmentShaderGltfSource = document.getElementById("fragment-shader-gltf-id").text;
		if(!fragmentShaderGltfSource){
			error("Failed to load Gltf Fragment Shader Source");
			return;
		}
		info("FragmentGltf:"+fragmentShaderGltfSource+":"+fragmentShaderGltfSource.constructor.name);


		var vertexSkinShader = webglUtils.createShader(gl,gl.VERTEX_SHADER,vertexShaderSkinSource);
		if(!vertexSkinShader){
			error("Failed to create the Skin vertex shader");
			return;
		}
		if(vertexSkinShader.constructor.name != "WebGLShader"){
			error("Vertex Skin Shader not WebGLShader:"+vertexSkinShader.constructor.name);
			return;
		}
		var vertexGltfShader = webglUtils.createShader(gl,gl.VERTEX_SHADER,vertexShaderGltfSource);
		if(!vertexGltfShader){
			error("Failed to create the Gltf vertex shader");
			return;
		}
		if(vertexGltfShader.constructor.name != "WebGLShader"){
			error("Vertex Gltf Shader not WebGLShader:"+vertexGltfShader.constructor.name);	
			return;
		}
		var fragmentGltfShader = webglUtils.createShader(gl,gl.FRAGMENT_SHADER,fragmentShaderGltfSource);
		if(!fragmentGltfShader){
			error("Failed to create the Gltf fragment shader");
			return;
		}
		if(fragmentGltfShader.constructor.name != "WebGLShader"){
			error("Fragment Gltf Shader not WebGLShader:"+fragmentGltfShader.constructor.name);
			return;
		}

		var vertexShaderEnvSource = document.getElementById("vertex-shader-env-id").text;
		if(!vertexShaderEnvSource){
			error("Failed to load Env vertex Shader Source");
			return;
		}
		info("VertexEnv:"+vertexShaderEnvSource+":"+vertexShaderEnvSource.constructor.name);
		var fragmentShaderEnvSource = document.getElementById("fragment-shader-env-id").text;
		if(!fragmentShaderEnvSource){
			error("Failed to load Env fragment Shader Source");
			return;
		}
		info("FragmentEnv:"+fragmentShaderEnvSource+":"+fragmentShaderEnvSource.constructor.name);

		var vertexEnvShader = webglUtils.createShader(gl,gl.VERTEX_SHADER,vertexShaderEnvSource);
		if(!vertexEnvShader){
			error("Failed to create the Env vertex shader");
			return;
		}
		if(vertexEnvShader.constructor.name != "WebGLShader"){
			error("Vertex Env Shader not WebGLShader:"+vertexEnvShader.constructor.name);	
			return;
		}
		var fragmentEnvShader = webglUtils.createShader(gl,gl.FRAGMENT_SHADER,fragmentShaderEnvSource);
		if(!fragmentEnvShader){
			error("Failed to create the Env fragment shader");
			return;
		}
		if(fragmentEnvShader.constructor.name != "WebGLShader"){
			error("Fragment Env Shader not WebGLShader:"+fragmentEnvShader.constructor.name);
			return;
		}
		var vertexShaderSkySource = document.getElementById("vertex-shader-sky-id").text;
		if(!vertexShaderSkySource){
			error("Failed to load Sky Vertex Shader Source");
			return;
		}
		info("Vertex:"+vertexShaderSkySource+":"+vertexShaderSkySource.constructor.name);
		var fragmentShaderSkySource = document.getElementById("fragment-shader-sky-id").text;
		if(!fragmentShaderSkySource){
			error("Failed to get Sky Fragment Shader Source");
			return ;
		}
		info("Fragment:"+fragmentShaderSkySource+":"+vertexShaderSkySource.constructor.name);
		var vertexSkyShader = webglUtils.createShader(gl,gl.VERTEX_SHADER,vertexShaderSkySource);
		if(!vertexSkyShader){
			error("Failed to create the Sky vertex shader");
			return;
		}
		if(vertexSkyShader.constructor.name != "WebGLShader"){
			error("Vertex Shader not WebGLShader:"+vertexSkyShader.constructor.name);	
			return;
		}
		success("Vertex Shader Created:"+vertexSkyShader.constructor.name);
		var fragmentSkyShader = webglUtils.createShader(gl,gl.FRAGMENT_SHADER,fragmentShaderSkySource);
		if(!fragmentSkyShader){
			error("Failed to create the Sky fragment shader");
			return;
		}
		if(fragmentSkyShader.constructor.name != "WebGLShader"){
			error("Fragment Shader not WebGLShader:"+fragmentSkyShader.constructor.name);
			return;
		}
		success("Fragment Shader Created:"+fragmentSkyShader.constructor.name);


		var programSkin = webglUtils.createProgram(gl,vertexSkinShader,fragmentGltfShader);
		if(!programSkin){
			error("Failed to link the Skin Program");
			return;
		}
		if(programSkin.constructor.name!="WebGLProgram"){
			error("Link Program is not WebGLProgram:"+programSkin.constructor.name);
			return;
		}

		var programGltf = webglUtils.createProgram(gl,vertexGltfShader,fragmentGltfShader);
		if(!programGltf){
			error("Failed to link Gltf Program");
			return ;
		}
		if(programGltf.constructor.name!="WebGLProgram"){
			error("Link Program is not WebGLProgram:"+programGltf.constructor.name);
			return;
		}
		var skinProgramInfo= {
			program:programSkin,
			uniformSetters:createUniformSetters(gl,programSkin),
			attribSetters:createAttributeSetters(gl,programSkin),
		};
		var meshProgramInfo = {
			program:programGltf,
			uniformSetters:createUniformSetters(gl,programGltf),
			attribSetters:createAttributeSetters(gl,programGltf),
		};

		var programEnv = webglUtils.createProgram(gl,vertexEnvShader,fragmentEnvShader);
		if(!programEnv){
			error("Failed to link the Env program");
			return;
		}
		if(programEnv.constructor.name != "WebGLProgram"){
			error("Link Program is not WebGLProgram:"+programEnv.constructor.name);
			return;
		}
		success("Program Linked:"+programEnv.constructor.name);

		var programSky = webglUtils.createProgram(gl,vertexSkyShader,fragmentSkyShader);
		if(!programSky){
			error("Failed to link the Sky program");
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
		const gltf = gltfParser.loadGltf(gl,skinProgramInfo,'obj/whale.CYCLES.gltf').then((gltf) => {

		console.log("GLTF:",gltf);
		if(!gltf){
			error("Gltf Returns NULL");
			return ;
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

			//gl.clearColor((time%10/10),1-((time%7)/7),((time%14)/14),1);
			gl.clearColor(0,0,0,1);
			gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

			const aspect = gl.canvas.clientWidth/gl.canvas.clientHeight;
			if ( window.firstLoop )info("Aspect:"+aspect);

			const projectionMatrix = m4.perspective(fieldOfViewRadians,aspect,1,2000);
			if ( window.firstLoop )info("Projection:"+projectionMatrix);

			const cameraPosition = [Math.cos(time*.1)*10,0,Math.sin(time*.1)*-5];
			if(window.firstLoop)info("CameraPosition:"+cameraPosition);

			const cameraTarget = [0,0,-10];
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

			animSkin(gltf.skins[0],Math.sin(time)*.5);

			const sharedUniforms = {
				u_lightDirection: m4.normalize([-1,3,5]),
			};

			function renderDrawables(node){
				for(const drawable of node.drawables){
					if(window.firstLoop) info("Drawable:"+drawable.constructor.name);
					if(drawable.constructor.name=="SkinRenderer"){
						drawable.render(gl,skinProgramInfo,node,projectionMatrix,viewMatrix,sharedUniforms);
					}else{
						drawable.render(gl,meshProgramInfo,node,projectionMatrix,viewMatrix,sharedUniforms);
					}
				}
			}

			for (const scene of gltf.scenes){

				scene.root.updateWorldMatrix();
				scene.root.traverse(renderDrawables);
			}


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
		});
	}else{
		error("Canvas is invalid");
	}
}
