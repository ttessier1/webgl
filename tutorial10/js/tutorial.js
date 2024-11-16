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

		webglUtils.firstLoop = true;

		const uniformSetters = createUniformSetters(gl, program);
		const attribSetters = createAttributeSetters(gl,program);

		var programInfo = {
			program: program,
			uniformSetters: uniformSetters,
			attribSetters: attribSetters,
		};

		const cubeBufferInfo = primitives.createCubeWithVertexColorsBufferInfo(gl, 1);
		
		var cameraAngleRadians = webglUtils.degToRad(0);
		var fieldOfViewRadians = webglUtils.degToRad(60);
		var cameraHeight = 50;

		var objectsToDraw = [];
		var objects = [];
		var nodeInfosByName = {};

		var blockGuyNodeDescriptions= {
			name: "point between feet",
			draw: false,
			children:[{
				name:"waist",
				translations:[0,3,0],
				children:[{
					name: "torso",
					translation:[0,2,0],
					children:[{
						name: "neck",
						translation:[0,1,0],
						children:[{
							name:"head",
							translation:[0,1,0],
						},],
					},{
						name:"left-arm",
						translation:[-1,0,0],
						children:[{
							name:"left-forearm",
							translation: [-1,0,0],
							children:[{
								name:"left-hand",
								translation:[-1,0,0],
							},],
						},],

					},{
						name:"right-arm",
						translation:[1,0,0],
						children:[{
							name:"right-forearm",
							translation:[1,0,0],
							children:[{
								name:"right-hand",
								translation:[1,0,0],
							}],

						},],
					
					},],
				},{
					name:"left-leg",
					translation:[-1,-1,0],
					children:[{
						name:"left-calf",
						translation:[0,-1,0],
						children:[{
							name:"left-foot",
							translation:[0,-1,0],
						}],
					},],
				},{
					name:"right-leg",
					translation:[1,-1,0],
					children:[{
						name:"right-calf",
						translaction:[0,-1,0],
						children:[{
							name: "right-foot",
							translation:[0,-1,0],
						},],
					},],
				}],
			},],

		};


		function makeNode(name,nodeDescription){
			var trs= new TRS(name);
			var node = new Node(name,trs);
			nodeInfosByName[nodeDescription.name] = {
				trs:trs,
				node: node,
			};
			trs.translation = nodeDescription.translation || trs.translation;
			if(nodeDescription.draw !== false){
				node.drawInfo = {
					uniforms: {
						u_colorOffset: [0,0,0.6,0],
						u_colorMult: [0.4,0.4,0.4,1],
					},
					programInfo:programInfo,
					bufferInfo: cubeBufferInfo,
				};
				objectsToDraw.push(node.drawInfo);
				objects.push(node);
			}
			makeNodes(nodeDescription.children).forEach(function(child){
				child.setParent(node);
			});
			return node;
		}

		function makeNodes(nodeDescriptions){
			return nodeDescriptions ? nodeDescriptions.map((obj) => makeNode(obj.name,obj)):[];
		}

		var scene = makeNode("man",blockGuyNodeDescriptions);

		

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

			const cameraPosition = [4,3.5,10];
			if(window.firstLoop)info("CameraPosition:"+cameraPosition);

			const cameraTarget = [0,3.5,0];
			if(window.firstLoop)info("CameraTarget:"+cameraTarget);

			const up = [0,1,0];
			if ( window.firstLoop )info("Up:"+up);

			const cameraMatrix = m4.lookAt(cameraPosition,cameraTarget,up);
			if ( window.firstLoop )info("Camera:"+cameraMatrix);

			const viewMatrix = m4.inverse(cameraMatrix);
			if ( window.firstLoop )info("View:"+viewMatrix);

			const viewProjectionMatrix = m4.multiply(projectionMatrix,viewMatrix);
			if(window.firstLoop)info("View Projection:"+viewProjectionMatrix);

			scene.updateWorldMatrix();

			var adjust;
			var speed = 3;
			var c = time * speed;

			adjust = Math.abs(Math.sin(c));
			nodeInfosByName["point between feet"].trs.translation[1] = adjust;
			adjust = Math.sin(c);
			nodeInfosByName["left-leg"].trs.rotation[0] = adjust ;
			nodeInfosByName["right-leg"].trs.rotation[0] = -adjust ;
			adjust = Math.sin(c+0.1)*0.4 ;
			nodeInfosByName["left-calf"].trs.rotation[0] = -adjust ;
			nodeInfosByName["right-calf"].trs.rotation[0] = adjust ;
			adjust = Math.sin(c+0.1)*0.4 ;
			nodeInfosByName["left-foot"].trs.rotation[0] = -adjust ;
			nodeInfosByName["right-foot"].trs.rotation[0] = adjust ;
			adjust = Math.sin(c)*0.4 ;
			nodeInfosByName["left-arm"].trs.rotation[2] = adjust ;
			nodeInfosByName["right-arm"].trs.rotation[2] = adjust ;
			adjust = Math.sin(c+0.1)*0.4 ;
			nodeInfosByName["left-forearm"].trs.rotation[2]= adjust ;
			nodeInfosByName["right-forearm"].trs.rotation[2] = adjust ;
			adjust = Math.sin(c-0.1)*0.4 ;
			nodeInfosByName["left-hand"].trs.rotation[2] = adjust ;
			nodeInfosByName["right-hand"].trs.rotation[2] = adjust ;

			adjust = Math.sin(c) * 0.4;
			nodeInfosByName["waist"].trs.rotation[1] = adjust ;
			adjust = Math.sin(c) * 0.4;
			nodeInfosByName["torso"].trs.rotation[1]= adjust ;
			adjust = Math.sin(c+0.25)*0.4;
			nodeInfosByName["neck"].trs.rotation[1] = adjust ;
			adjust = Math.sin(c+0.5)*0.4;
			nodeInfosByName["head"].trs.rotation[1] = adjust ;
			adjust = Math.sin(c*2)*0.4;
			nodeInfosByName["head"].trs.rotation[0] = adjust;

			objects.forEach(function(object){
				object.drawInfo.uniforms.u_matrix = m4.multiply(viewProjectionMatrix,object.worldMatrix);

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
