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
	log("Inside Main");	
	const canvs= document.getElementById("canvs");
	canvs.width = 480;
	canvs.height = 360;
	canvs.style.width = 400;
	canvs.style.height = 360;
	if(canvs){
		success("Canvas obj is potentially valid");

		var objFile = document.getElementById("objfile").text;
		if(!objFile){
			error("Failed to get object file");
			return;
		}
		success("Object:"+objFile.constructor.name);

		const data = ObjectParser.Parse(objFile);
		console.log("Data:",data);

		const gl = canvs.getContext("webgl");
		if(gl === null || gl.constructor.name != "WebGLRenderingContext" ){
			console.log("Unable to initialize");
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
		var vertexShader = createShader(gl,gl.VERTEX_SHADER,vertexShaderSource);
		if(!vertexShader){
			error("Failed to create the vertex shader");
			return;
		}
		if(vertexShader.constructor.name != "WebGLShader"){
			error("Vertex Shader not WebGLShader:"+vertexShader.constructor.name);	
			return;
		}
		success("Vertex Shader Created:"+vertexShader.constructor.name);
		var fragmentShader = createShader(gl,gl.FRAGMENT_SHADER,fragmentShaderSource);
		if(!fragmentShader){
			error("Failed to create the fragment shader");
			return;
		}
		if(fragmentShader.constructor.name != "WebGLShader"){
			error("Fragment Shader not WebGLShader:"+fragmentShader.constructor.name);
			return;
		}
		success("Fragment Shader Created:"+fragmentShader.constructor.name);

		var program = createProgram(gl,vertexShader,fragmentShader);
		if(!program){
			error("Failed to link the program");
			return;
		}
		if(program.constructor.name != "WebGLProgram"){
			error("Linke Program is not WebGLProgram:"+program.constructor.name);
			return;
		}
		success("Program Linked:"+program.constructor.name);
		

		const bufferInfo = createBufferInfoFromArrays(gl,data);
		console.log("BufferInfo:",bufferInfo,bufferInfo.constructor.name);
		if( !bufferInfo.hasOwnProperty("attribs")){
			error("BufferInfo does not contain attributes");
			return;
		}
		if(!bufferInfo.attribs.hasOwnProperty("a_normal")){
			error("BufferInfo Missing a_normal attrib");
			return;
		}
		if(typeof(bufferInfo.attribs.a_normal.hasOwnProperty("buffer"))=="undefined" || bufferInfo.attribs.a_normal.buffer.constructor.name != "WebGLBuffer" ){
			error("BufferInfo[a_normal] is missing or not WebGLBuffer:"+bufferInfo.attribs.a_normal.buffer.constructor.name);
			return;
		}
		if(!bufferInfo.attribs.hasOwnProperty("a_position")){
			error("BufferInfo Missing a_position attrib");
			return ;
		}
		if(typeof(bufferInfo.attribs.a_position.hasOwnProperty("buffer"))=="undefined" || bufferInfo.attribs.a_position.buffer.constructor.name != "WebGLBuffer"){
			error("BufferInfo[a_position] is missing or not WebGLBuffer");
			return ;
		}
		if(!bufferInfo.attribs.hasOwnProperty("a_texcoord")){
			error("BufferInfo Missing a_texcoord attrib");
			return ;
		}
		if(typeof(bufferInfo.attribs.a_texcoord.hasOwnProperty("buffer"))=="undefined" || bufferInfo.attribs.a_texcoord.buffer.constructor.name != "WebGLBuffer"){
			error("BufferInfo[a_texcoord] is missing or not WebGLBuffer");
			return ;
		}

		const cameraTarget = [0,0,0];
		const cameraPosition = [0,0,4];
		const zNear = 0.1;
		const zFar = 50;

		function degToRad(deg){
			return deg * Math.PI/180;
		}

		function render(time){
			time *= 0.001;
			gl.viewport(0,0,gl.canvas.width,gl.canvas.height);

			gl.enable(gl.DEPTH_TEST);
			gl.enable(gl.CULL_FACE);

			const fieldOfViewRadians = degToRad(60);
			info("FieldOfViewRadians:"+fieldOfViewRadians);
			const aspect = gl.canvas.clientWidth/gl.canvas.clientHeight;
			info("Aspect:"+aspect);
			const projection = m4.perspective(fieldOfViewRadians,aspect,zNear,zFar);
			info("Projection:"+projection);

			const up = [0,1,0];
			info("Up:"+up);

			const camera = m4.lookAt(cameraPosition,cameraTarget,up);
			info("Camera:"+camera);

			const view = m4.inverse(camera);
			info("View:"+view);

			const sharedUniforms = {
				u_lightDirection: m4.normalize([-1,3,5]),
				u_view: view,
				u_projection: projection,
			};


			const uniformSetters = createUniformSetters(gl, program);
			if(!uniformSetters){
				error("Failed to create UniformSetters");
				return;
			}
			const attribSetters = createAttributeSetters(gl, program);
			if(!attribSetters){
				error("Failed to create AttributeSetters");
				return;
			}

			const meshProgramInfo = {
				program: program,
				uniformSetters: uniformSetters,
				attribSetters: attribSetters,
			};


			gl.useProgram(meshProgramInfo.program);

			setUniforms(meshProgramInfo, sharedUniforms);

			setBuffersAndAttributes(gl,meshProgramInfo,bufferInfo);

			setUniforms(meshProgramInfo,{
				u_world: m4.yRotation(time),
				u_diffuse: [1,0.7,0.5,1]
			});
		
			drawBufferInfo(gl,bufferInfo);
			requestAnimationFrame(render);
		}
		//render();
		requestAnimationFrame(render);
	}else{
		error("Canvas is invalid");
	}
}

function drawBufferInfo(gl, bufferInfo, primitiveType, count, offset) {
	console.log("drawBufferInfo:");
	const indices = bufferInfo.indices;
	primitiveType = primitiveType === undefined ? gl.TRIANGLES : primitiveType;
	const numElements = count === undefined ? bufferInfo.numElements : count;
	offset = offset === undefined ? 0 : offset;
	if (indices) {
		gl.drawElements(primitiveType, numElements, gl.UNSIGNED_SHORT, offset);
	} else {
		console.log("Drawing Buffer:"+offset+":"+numElements+":"+primitiveType);
		gl.drawArrays(primitiveType, offset, numElements);
	}
}

function setAttributes(setters, attribs) {
	setters = setters.attribSetters || setters;
	console.log("Attribs:",attribs);
	if(setters && attribs){
		Object.keys(attribs).forEach(function(name) {
			const setter = setters[name];
			if (setter) {
				setter(attribs[name]);
			}
		});
	}else{
	}
}

function setBuffersAndAttributes(gl, setters, buffers) {
	setAttributes(setters, buffers.attribs);
	console.log("SetBuffersAndAttributes:",buffers);
	if (buffers.indices) {
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
	}else{
		console.warn("No Indices Set");
	}
}

function createAttributeSetters(gl, program) {
	const attribSetters = { };
	function createAttribSetter(index) {
		return function(b) {
			if (b.value) {
				gl.disableVertexAttribArray(index);
				switch (b.value.length) {
					case 4:
						gl.vertexAttrib4fv(index, b.value);
					break;
					case 3:
						gl.vertexAttrib3fv(index, b.value);
					break;
					case 2:
						gl.vertexAttrib2fv(index, b.value);
					break;
					case 1:
						gl.vertexAttrib1fv(index, b.value);
					break;
					default:
						throw new Error('the length of a float constant value must be between 1 and 4!');
				}
			} else {
				gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
				gl.enableVertexAttribArray(index);
				gl.vertexAttribPointer(
				index, b.numComponents || b.size, b.type || gl.FLOAT, b.normalize || false, b.stride || 0, b.offset || 0);
			}
		};
	}

	const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
	for (let ii = 0; ii < numAttribs; ++ii) {
		const attribInfo = gl.getActiveAttrib(program, ii);
		if (!attribInfo) {
			break;
		}
		console.log("Attrib:"+attribInfo.name);
		const index = gl.getAttribLocation(program, attribInfo.name);
		attribSetters[attribInfo.name] = createAttribSetter(index);
	}
	return attribSetters;
}

function createUniformSetters(gl,program){
	console.log("createUniformSetters:");
	let textureUnit=0;
	function createUniformSetter(program,uniformInfo){
		const location = gl.getUniformLocation(program, uniformInfo.name);
		const type = uniformInfo.type;
		const isArray = (uniformInfo.size>1 && uniformInfo.name.substr(-3)=== '[0]');
		if ( type === gl.FLOAT){
			console.log("Found Float:");
			return function(v){
				gl.uniform1f(location,v);
			};
		}else if ( type === gl.FLOAT_VEC2){
			console.log("Found float Vec2");
			return function(v){
				gl.uniform2fv(location,v);
			};
		}else if ( type === gl.FLOAT_VEC3){
			console.log("Found float Vec3");
			return function(v){
				gl.uniform3fv(location,v);
			};
		}else if ( type === gl.FLOAT_VEC4){
			console.log("Found float Vec4");
			return function(v){
				gl.uniform4fv(location,v);
			};
		}else if ( type === gl.INT && isArray ){
			console.log("Found Array");
			return function(v){
				gl.uniform1iv(location,v);
			};
		}else if ( type === gl.INT ){
			console.log("Found INT");
			return function(v){
				gl.uniform1i(location,v);
			};
		} else if ( type === gl.INT_VEC2){
			console.log("Found Int Vec2");
			return function(v){
				gl.uniform2iv(location,v);
			};
		} else if ( type === gl.INT_VEC3){
			console.log("Found Int Vec3");
			return function(v){
				gl.uniform3iv(location,v);
			};
		}else if ( type === gl.INT_VEC4){
			console.log("Found Int Vec4");
			return function(v){
				gl.uniform4iv(location,v);
			};
		}else if ( type === gl.BOOL ){
			console.log("Found Bool");
			return function(v){
				gl.uniform1iv(location,v);
			};
		}else if ( type === gl.BOOL_VEC2 ){
			console.log("Found Bool Vec2");
			return function(v){
				gl.uniform2iv(location,v);
			};
		}else if ( type === gl.BOOL_VEC3 ){
			console.log("Found Bool Vec3");
			return function(v){
				gl.uniform3iv(location,v);
			};
		}else if ( type === gl.BOOL_VEC4 ){
			console.log("Found Bool Vec4");
			return function(v){
				gl.uniform4iv(location,v);
			};
		}else if ( type === gl.FLOAT_MAT2 ){
			console.log("Found float Matrix2");
			return function(v){
				gl.uniformMatrix2fv(location,false,v);
			};
		}else if ( type === gl.FLOAT_MAT3 ){
			console.log("Found float Matrix3");
			return function(v){
				gl.uniformMatrix3fv(location,false,v);
			};
		}else if ( type === gl.FLOAT_MAT4 ){
			console.log("Found float Matrix4");
			return function(v){
				gl.uniformMatrix4fv(location,false,v);
			};
		}
		if((type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) && isArray){
			console.log("Found SAMPLE_2D or SAMPLER_CUBE");
			const units = [];
			for(let ii = 0; ii < info.size; ++i){
				units.push(textureUnit++);
			}
			return function(bindPoint,unit){
				return function(textures){
					textures.foreach(function(texture,index){
						gl.activeTexture(gl.TEXTURE0+unit);
						gl.bindTecture(bindPoint,texture);
					});
				};
			}(getBindPointForSamplerType(gl,type),textureUnit++);
		}
		throw ( "Unknown Type:0x"+ type.toString(16));
	} 
		
	const uniformSetters = {};
	const numUniforms = gl.getProgramParameter(program,gl.ACTIVE_UNIFORMS);
	console.log("NumUniforms:"+numUniforms);
	for ( let ii = 0; ii < numUniforms ; ++ii){
		const uniformInfo = gl.getActiveUniform(program,ii);
		if(!uniformInfo){
			console.log("Early Exist:"+ii+" ");
			break;
		}
		console.log("Uniform:"+uniformInfo.name);
		let name = uniformInfo.name;
		if(name.substr(-3)=='[0]'){
			name = name.subst(0,name.length-3);
		}
		const setter = createUniformSetter(program, uniformInfo);
		uniformSetters[name] = setter;
	}
	return uniformSetters ;
}

function setUniforms(setters, ...values){
	console.log("Setters:",setters);
	setters = setters.uniformSetters||setters;
	for(const uniforms of values){
		Object.keys(uniforms).forEach(function(name){
			console.log("Setting:"+name);
			const setter= setters[name];
			if(setter){
				setter(uniforms[name]);
			}else{
				console.log("No Setter");
			}
		});
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

function augmentTypedArray(typedArray,numComponents){
	let cursor = 0 ;
	typedArray.push = function(){
		for (let ii = 0 ; ii < arguments.length ; ii++){
			const value = arguments[ii];
			if(value instanceof Array ||value.buffer &&value.buffer instanceof ArrayBuffer){
				for ( let jj= 0 ; jj< value.length; ++jj){
					typedArray[cursor++] = value[jj];
					
				}
				
			}else{
				typedArray[cursor++] = value;	
			}
		}
	};
	typedArray.reset = function(opt_index){
		cursor = opt_index||0;
	};
	typedArray.numComponents = numComponents;
	Object.defineProperty(typedArray,"numElements",{
		get: function(){
			return this.length / this.numComponents | 0;
		}
	});
	return typedArray;
}

const texcoordRE = /coord|texture/i;
const colorRE = /color|colour/i;

function guessNumComponentsFromName(name,length){
	let numComponents;
	if(texcoordRE.test(name)){
		numComponents = 2;
	}else if(colorRE.test(name)){
		numComponents = 4;
	}else{
		numComponents = 3;
	}
	if(length%numComponents>0){
		throw new Error("Can not guess number of components from name");
	}
	return numComponents;
}

function createAugmentedTypedArray(numComponents,numElements,opt_type){
	const Type = opt_type||Float32Array;
	console.log("New Type:"+Type.constructor.name);
	var array = augmentTypedArray(new Type(numComponents*numElements),numComponents);
	console.log("Array:",array.constructor.name);
	return array;
}

function makeTypedArray(array,name){
	if(isArrayBuffer(array)){
		return array;
	}
	if(array.data && isArrayBuffer(array.data)){
		return array.data;
	}
	if(Array.isArray(array)){
		array = {
			data: array
		};
	}
	if(!array.numComponents){
		array.numComponents = guessNumComponentsFromName(name,array.length);
	}
	let type = array.type;
	if(!type){
		if(name==='indices'){
			type = Uint16Array;
		}
	}
	const typedArray = createAugmentedTypedArray(array.numComponents,array.data.length/array.numComponents|0,type);
	typedArray.push(array.data);
	return typedArray;
}

function isArrayBuffer(a){
	return a.buffer && a.buffer instanceof ArrayBuffer;
}

function createBufferFromTypedArray(gl,array,type,drawType){
	type = type || gl.ARRAY_BUFFER;
	const buffer = gl.createBuffer();
	gl.bindBuffer(type,buffer);
	gl.bufferData(type,array,drawType||gl.STATIC_DRAW);
	return buffer;
}

function allButIndices(name) {
	return name !== 'indices';
}

function createMapping(obj) {
	const mapping = {};
	Object.keys(obj).filter(allButIndices).forEach(function(key) {
		mapping['a_' + key] = key;
	});
	return mapping;
}

function getGLTypeForTypedArray(gl, typedArray) {
	if (typedArray instanceof Int8Array)    { return gl.BYTE; }          // eslint-disable-line
	if (typedArray instanceof Uint8Array)   { return gl.UNSIGNED_BYTE; } // eslint-disable-line
	if (typedArray instanceof Int16Array)   { return gl.SHORT; }         // eslint-disable-line
	if (typedArray instanceof Uint16Array)  { return gl.UNSIGNED_SHORT; }// eslint-disable-line
	if (typedArray instanceof Int32Array)   { return gl.INT; }           // eslint-disable-line
	if (typedArray instanceof Uint32Array)  { return gl.UNSIGNED_INT; }  // eslint-disable-line
	if (typedArray instanceof Float32Array) { return gl.FLOAT; }         // eslint-disable-line
	throw 'unsupported typed array type';
}

function getNormalizationForTypedArray(typedArray) {
	if (typedArray instanceof Int8Array)    { return true; }  // eslint-disable-line
	if (typedArray instanceof Uint8Array)   { return true; }  // eslint-disable-line
	return false;
}

function getArray(array) {
	return array.length ? array : array.data;
}

function getNumComponents(array, arrayName) {
	return array.numComponents || array.size || guessNumComponentsFromName(arrayName, getArray(array).length);
}


const positionKeys = ['position', 'positions', 'a_position'];
function getNumElementsFromNonIndexedArrays(arrays) {
	let key;
	for (const k of positionKeys) {
		if (k in arrays) {
			key = k;
			break;
		}
	}
	key = key || Object.keys(arrays)[0];
	const array = arrays[key];
	const length = getArray(array).length;
	const numComponents = getNumComponents(array, key);
	const numElements = length / numComponents;
	if (length % numComponents > 0) {
		throw new Error(`numComponents ${numComponents} not correct for length ${length}`);
	}
	return numElements;
}

function createAttribsFromArrays(gl, arrays, opt_mapping) {
	const mapping = opt_mapping || createMapping(arrays);
	const attribs = {};
	Object.keys(mapping).forEach(function(attribName) {
		const bufferName = mapping[attribName];
		const origArray = arrays[bufferName];
		if (origArray.value) {
			attribs[attribName] = {
				value: origArray.value,
			};
		} else {
			const array = makeTypedArray(origArray, bufferName);
			attribs[attribName] = {
				buffer:        createBufferFromTypedArray(gl, array),
				numComponents: origArray.numComponents || array.numComponents || guessNumComponentsFromName(bufferName),
				type:          getGLTypeForTypedArray(gl, array),
				normalize:     getNormalizationForTypedArray(array),
			};
		}
	});
	return attribs;
}

function createBuffersFromArrays(gl, arrays) {
	const buffers = { };
	Object.keys(arrays).forEach(function(key) {
		const type = key === 'indices' ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
		const array = makeTypedArray(arrays[key], name);
		buffers[key] = createBufferFromTypedArray(gl, array, type);
	});
	if (arrays.indices) {
		buffers.numElements = arrays.indices.length;
	} else if (arrays.position) {
		buffers.numElements = arrays.position.length / 3;
	}
	return buffers;
}

function createBufferInfoFromArrays(gl, arrays, opt_mapping) {
	const bufferInfo = {
		attribs: createAttribsFromArrays(gl, arrays, opt_mapping),
	};
	let indices = arrays.indices;
	if (indices) {
		indices = makeTypedArray(indices, 'indices');
		bufferInfo.indices = createBufferFromTypedArray(gl, indices, gl.ELEMENT_ARRAY_BUFFER);
		bufferInfo.numElements = indices.length;
	} else {
		bufferInfo.numElements = getNumElementsFromNonIndexedArrays(arrays);
	}
	return bufferInfo;
}
