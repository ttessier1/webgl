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

		var vertexShaderSource = document.getElementById("vertex-shader-id").text;
		if(!vertexShaderSource){
			error("Failed to load Vertex Shader Source");
			return;
		}
		info("Vertex:"+vertexShaderSource+":"+vertexShaderSource.constructor.name);
		var fragmentShaderSource = document.getElementById("fragment-shader-id").text;
		if(!fragmentShaderSource){
			error("Failed to get Fragment Shader Source");
			return ;
		}
		info("Fragment:"+fragmentShaderSource+":"+vertexShaderSource.constructor.name);
		var vertexShader = webglUtils.createShader(gl,gl.VERTEX_SHADER,vertexShaderSource);
		if(!vertexShader){
			error("Failed to create the vertex shader");
			return;
		}
		if(vertexShader.constructor.name != "WebGLShader"){
			error("Vertex Shader not WebGLShader:"+vertexShader.constructor.name);	
			return;
		}
		success("Vertex Shader Created:"+vertexShader.constructor.name);
		var fragmentShader = webglUtils.createShader(gl,gl.FRAGMENT_SHADER,fragmentShaderSource);
		if(!fragmentShader){
			error("Failed to create the fragment shader");
			return;
		}
		if(fragmentShader.constructor.name != "WebGLShader"){
			error("Fragment Shader not WebGLShader:"+fragmentShader.constructor.name);
			return;
		}
		success("Fragment Shader Created:"+fragmentShader.constructor.name);

		var program = webglUtils.createProgram(gl,vertexShader,fragmentShader);
		if(!program){
			error("Failed to link the program");
			return;
		}
		if(program.constructor.name != "WebGLProgram"){
			error("Link Program is not WebGLProgram:"+program.constructor.name);
			return;
		}
		success("Program Linked:"+program.constructor.name);


		const uniformSetters = createUniformSetters(gl, program);
		const attribSetters = createAttributeSetters(gl,program);

		var programInfo = {
			program: program,
			uniformSetters: uniformSetters,
			attribSetters: attribSetters,
		};
		
		var sphereBufferInfo = primitives.createSphereWithVertexColorsBufferInfo(gl,10,12,6);

		var cameraAngleRadians = webglUtils.degToRad(0);
		var fieldOfViewRadians = webglUtils.degToRad(60);
		var cameraHeight = 50;

		var objectsToDraw = [];
		var objects = [];

		var solarSystemNode = new Node("Solar System");
		var earthOrbitNode = new Node("Earth Orbit");
		earthOrbitNode.localMatrix = m4.translation(100,0,0);
		var moonOrbitNode = new Node("Moon Orbit");
		moonOrbitNode.localMatrix = m4.translation(30,0,0);

		var sunNode = new Node("Sun");
		//sunNode.localMatrix = m4.translation(0,0,0);
		sunNode.localMatrix = m4.scaling(5,5,5);
		sunNode.drawInfo = {
			uniforms: {
				u_colorOffset:[0.6,0.6,0,1],
				u_colorMult:[0.4,0.4,0,1],
			},
			programInfo: programInfo,
			bufferInfo: sphereBufferInfo,
		};

		var earthNode = new Node("Earth");
		//earthNode.localMatrix = m4.translation(100,0,0);
		//earthNode.localMatrix = m4.scale(earthNode.localMatrix,2,2,2);
		earthNode.localMatrix = m4.scaling(2,2,2);
		earthNode.drawInfo = {
			uniforms:{
				u_colorOffset:[0.2,0.5,0.8,1],
				u_colorMult: [0.8,0.5,0.2,1],
			},
			programInfo: programInfo,
			bufferInfo: sphereBufferInfo,
		};

		var moonNode = new Node("Moon");
		//moonNode.localMatrix = m4.translation(20,0,0);
		moonNode.localMatrix = m4.scaling(0.4,0.4,0.4);
		moonNode.drawInfo = {
			uniforms:{
				u_colorOffset: [0.7,0.7,0.7,1],
				u_colorMult: [0.1,0.1,0.1,1],
			},
			programInfo: programInfo,
			bufferInfo: sphereBufferInfo,
		};

		sunNode.setParent(solarSystemNode);
		earthOrbitNode.setParent(solarSystemNode);
		earthNode.setParent(earthOrbitNode);
		moonOrbitNode.setParent(earthOrbitNode);
		moonNode.setParent(moonOrbitNode);

		var objects = [
			sunNode,
			earthNode,
			moonNode,
		];

		var objectsToDraw= [
			sunNode.drawInfo,
			earthNode.drawInfo,
			moonNode.drawInfo,
		];
		window.firstLoop = true;
		window.continueLoop = true;

		function render(time){
			
			time *= 0.0005;
			gl.viewport(0,0,gl.canvas.width,gl.canvas.height);

			gl.enable(gl.DEPTH_TEST);
			gl.enable(gl.CULL_FACE);

			gl.clearColor(0,0,0,1);
			gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

			const aspect = gl.canvas.clientWidth/gl.canvas.clientHeight;
			if ( window.firstLoop )info("Aspect:"+aspect);

			const projectionMatrix = m4.perspective(fieldOfViewRadians,aspect,1,2000);
			if ( window.firstLoop )info("Projection:"+projectionMatrix);

			const cameraPosition = [0,-200,0];
			if(window.firstLoop)info("CameraPosition:"+cameraPosition);

			const cameraTarget = [0,0,0];
			if(window.firstLoop)info("CameraTarget:"+cameraTarget);

			const up = [0,0,1];
			if ( window.firstLoop )info("Up:"+up);

			const cameraMatrix = m4.lookAt(cameraPosition,cameraTarget,up);
			if ( window.firstLoop )info("Camera:"+cameraMatrix);

			const viewMatrix = m4.inverse(cameraMatrix);
			if ( window.firstLoop )info("View:"+viewMatrix);

			const viewProjectionMatrix = m4.multiply(projectionMatrix,viewMatrix);
			if(window.firstLoop)info("View Projection:"+viewProjectionMatrix);

		//	m4.multiply(m4.yRotation(0.01),sunNode.localMatrix, sunNode.localMatrix);
		//	m4.multiply(m4.yRotation(0.01),earthNode.localMatrix,earthNode.localMatrix);
		//	m4.multiply(m4.yRotation(0.01),moonNode.localMatrix,moonNode.localMatrix);
			m4.multiply(m4.yRotation(0.01),earthOrbitNode.localMatrix,earthOrbitNode.localMatrix);
			m4.multiply(m4.yRotation(0.01),moonOrbitNode.localMatrix,moonOrbitNode.localMatrix);
			m4.multiply(m4.yRotation(0.05),earthNode.localMatrix,earthNode.localMatrix);
			m4.multiply(m4.yRotation(-0.01),moonNode.localMatrix,moonNode.localMatrix);
		

			//sunNode.updateWorldMatrix();
			solarSystemNode.updateWorldMatrix();

			objects.forEach(function(object){
				object.drawInfo.uniforms.u_matrix = m4.multiply(viewProjectionMatrix,object.worldMatrix);
				if ( window.firstLoop) info("Setting UMatrix:"+object.name+" "+object.drawInfo.uniforms.u_matrix);
			});

			var lastUsedProgramInfo = null;
			var lastUsedBufferInfo = null;

			var objCount = 0 ;
			objectsToDraw.forEach(function(object){
				objCount++;
				var programInfo= object.programInfo;
				var bufferInfo = object.bufferInfo;
				var bindBuffers = false;

				if(programInfo !== lastUsedProgramInfo){
					if(window.firstLoop) console.log("Replacing programInfo:"+objCount);
					lastUsedProgramInfo = programInfo;
					if(programInfo.program.constructor.name !== "WebGLProgram" ){
						error("Program is not WebGLProgram:"+programInfo.program.constructor.name);
						window.continueLoop = false;
						return;
					}
					gl.useProgram(programInfo.program);
					bindBuffers = true;
				}
				if(bindBuffers ||bufferInfo != lastUsedBufferInfo){
					if(window.firstLoop) console.log("Replacing BufferInfo:"+objCount+" ");
					lastUsedBufferInfo = bufferInfo;
					webglUtils.setBuffersAndAttributes(gl,programInfo,bufferInfo);
				}
				if(window.firstLoop) console.log("Uniforms:",object.uniforms);
				webglUtils.setUniforms(programInfo, object.uniforms);
				if(window.firstLoop) console.log("Drawing Object:"+objCount+":"+bufferInfo.numElements);
				if(window.firstLoop) console.log("BufferInfo:",bufferInfo);
				gl.drawArrays(gl.TRIANGLES,0,bufferInfo.numElements);
			});
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
