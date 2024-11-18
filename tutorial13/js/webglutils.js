"use strict";
function drawBufferInfo(gl, bufferInfo, primitiveType, count, offset) {
	var indices = undefined;
	if(bufferInfo.indices === undefined){
		if(webglUtils.firstLoop)warning("Indices Undefined");
	}else{
		indices = bufferInfo.indices;
	}
	var numElements = 0 ;
	if(primitiveType===undefined){
		if(webglUtils.firstLoop)warning("PrimitiveType Undefined");
		primitiveType = gl.TRIANGLES;
	}
	if(count == undefined){
		if(webglUtils.firstLoop)warning("Count Undefined");
		numElements = bufferInfo.numElements;
	}else{
		numElements = count;
	}
	if(offset==undefined){
		if(webglUtils.firstLoop)warning("Offset Undefined");
		offset = 0 ;
	}
	if (indices) {
		if(webglUtils.firstLoop)info("Drawing Indices:"+primitiveType+":"+numElements+":"+offset);
		gl.drawElements(primitiveType, numElements, gl.UNSIGNED_SHORT, offset);
	} else {
		if(webglUtils.firstLoop)info("Drawing:"+primitiveType+":"+numElements+":"+offset);
		gl.drawArrays(primitiveType, offset, numElements);
	}
}

function setAttributes(setters, attribs) {
	setters = setters.attribSetters || setters;
	if(setters && attribs){
		Object.keys(attribs).forEach(function(name) {
			if(webglUtils.firstLoop) info ("Setting Attribute:["+name+"]");
			const setter = setters[name];
			if (setter) {
				setter(attribs[name]);
			}else{
				if(webglUtils.firstLoop) error("Setter not set for:["+name+"]");
			}
		});
	}else{
	}
}

function setBuffersAndAttributes(gl, setters, buffers) {
	setAttributes(setters, buffers.attribs);
	if (buffers.indices) {
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
	}else{
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
		const index = gl.getAttribLocation(program, attribInfo.name);
		attribSetters[attribInfo.name] = createAttribSetter(index);
	}
	return attribSetters;
}
function getBindPointForSamplerType(gl, type) {
	if (type === gl.SAMPLER_2D)   return gl.TEXTURE_2D;        // eslint-disable-line
	if (type === gl.SAMPLER_CUBE) return gl.TEXTURE_CUBE_MAP;  // eslint-disable-line
	return undefined;
}

function createUniformSetters(gl,program){
	let textureUnit=0;
	function createUniformSetter(program,uniformInfo){
		const location = gl.getUniformLocation(program, uniformInfo.name);
		const type = uniformInfo.type;
		const isArray = (uniformInfo.size>1 && uniformInfo.name.substr(-3)=== '[0]');
		if ( type === gl.FLOAT){
			return function(v){
				if ( window.webglUtils.firstLoop) info("Setting Float:["+uniformInfo.name+"]"+v);
				gl.uniform1f(location,v);
			};
		}else if ( type === gl.FLOAT_VEC2){
			return function(v){
				if ( window.webglUtils.firstLoop) info("Setting Float VEC2:["+uniformInfo.name+"]"+v);
				gl.uniform2fv(location,v);
			};
		}else if ( type === gl.FLOAT_VEC3){
			return function(v){
				if ( window.webglUtils.firstLoop) info("Setting Float VEC3:["+uniformInfo.name+"]"+v);
				gl.uniform3fv(location,v);
			};
		}else if ( type === gl.FLOAT_VEC4){
			return function(v){
				if ( window.webglUtils.firstLoop) info("Setting Float VEC4:["+uniformInfo.name+"]"+v);
				gl.uniform4fv(location,v);
			};
		}else if ( type === gl.INT && isArray ){
			return function(v){
				if ( window.webglUtils.firstLoop) info("Setting INTArray:["+uniformInfo.name+"]"+v);
				gl.uniform1iv(location,v);
			};
		}else if ( type === gl.INT ){
			return function(v){
				if ( window.webglUtils.firstLoop) info("Setting INT:["+uniformInfo.name+"]"+v);
				gl.uniform1i(location,v);
			};
		} else if ( type === gl.INT_VEC2){
			return function(v){
				if ( window.webglUtils.firstLoop) info("Setting INT VEC2:["+uniformInfo.name+"]"+v);
				gl.uniform2iv(location,v);
			};
		} else if ( type === gl.INT_VEC3){
			return function(v){
				if ( window.webglUtils.firstLoop) info("Setting INT VEC3:["+uniformInfo.name+"]"+v);
				gl.uniform3iv(location,v);
			};
		}else if ( type === gl.INT_VEC4){
			return function(v){
				if ( window.webglUtils.firstLoop) info("Setting INT VEC4:["+uniformInfo.name+"]"+v);
				gl.uniform4iv(location,v);
			};
		}else if ( type === gl.BOOL ){
			return function(v){
				if ( window.webglUtils.firstLoop) info("Setting BOOL:["+uniformInfo.name+"]"+v);
				gl.uniform1iv(location,v);
			};
		}else if ( type === gl.BOOL_VEC2 ){
			return function(v){
				if ( window.webglUtils.firstLoop) info("Setting BOOL VEC2:["+uniformInfo.name+"]"+v);
				gl.uniform2iv(location,v);
			};
		}else if ( type === gl.BOOL_VEC3 ){
			return function(v){
				if ( window.webglUtils.firstLoop) info("Setting BOOL VEC3:["+uniformInfo.name+"]"+v);
				gl.uniform3iv(location,v);
			};
		}else if ( type === gl.BOOL_VEC4 ){
			return function(v){
				if ( window.webglUtils.firstLoop) info("Setting BOOL VEC4:["+uniformInfo.name+"]"+v);
				gl.uniform4iv(location,v);
			};
		}else if ( type === gl.FLOAT_MAT2 ){
			return function(v){
				if ( window.webglUtils.firstLoop) info("Setting Float MAT2:["+uniformInfo.name+"]"+v);
				gl.uniformMatrix2fv(location,false,v);
			};
		}else if ( type === gl.FLOAT_MAT3 ){
			return function(v){
				if ( window.webglUtils.firstLoop) info("Setting Float MAT3:["+uniformInfo.name+"]"+v);
				gl.uniformMatrix3fv(location,false,v);
			};
		}else if ( type === gl.FLOAT_MAT4 ){
			return function(v){
				if ( window.webglUtils.firstLoop) info("Setting Float MAT4:["+uniformInfo.name+"]"+v);
				gl.uniformMatrix4fv(location,false,v);
			};
		}
		if ((type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) && isArray) {
			const units = [];
			for (let ii = 0; ii < info.size; ++ii) {
				units.push(textureUnit++);
			}
			return function(bindPoint, units) {
				return function(textures) {
					gl.uniform1iv(location, units);
					textures.forEach(function(texture, index) {
						gl.activeTexture(gl.TEXTURE0 + units[index]);
						gl.bindTexture(bindPoint, texture);
					});
				};
			}(getBindPointForSamplerType(gl, type), units);
		}
		if (type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) {
			return function(bindPoint, unit) {
				return function(texture) {
					gl.uniform1i(location, unit);
					gl.activeTexture(gl.TEXTURE0 + unit);
					gl.bindTexture(bindPoint, texture);
				};
			}(getBindPointForSamplerType(gl, type), textureUnit++);
		}
		throw ( "Unknown Type: for["+uniformInfo.name+"] 0x"+ type.toString(16));
	} 
		
	const uniformSetters = {};
	const numUniforms = gl.getProgramParameter(program,gl.ACTIVE_UNIFORMS);
	for ( let ii = 0; ii < numUniforms ; ++ii){
		const uniformInfo = gl.getActiveUniform(program,ii);
		if(!uniformInfo){
			break;
		}
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
	setters = setters.uniformSetters||setters;
	for(const uniforms of values){
		Object.keys(uniforms).forEach(function(name){
			if(webglUtils.firstLoop) info("Setting Uniform:["+name+"]");
			const setter= setters[name];
			if(setter){
				setter(uniforms[name]);
			}else{
			}
		});
	}
}

function createShader(gl,type,source){
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
	var array = augmentTypedArray(new Type(numComponents*numElements),numComponents);
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


function getExtents(positions){
	const min = positions.slice(0,3);
	const max = positions.slice(0,3);
	for(let i = 0; i < positions.length; i+=3){
		for(let j = 0; j < 3 ; ++j ){
			const v = positions[i+j];
			min[j] = Math.min(v,min[j]);
			max[j] = Math.max(v,max[j]);
		}
	}
	return { min, max};
}

function getGeometriesExtents(geometries){
	return geometries.reduce(({min,max},{data}) => {
		const minMax = getExtents(data.position);
		return {
			min: min.map((min,ndx) => Math.min(minMax.min[ndx],min)),
			max: max.map((max,ndx) => Math.max(minMax.max[ndx],max))
		};
	},{
		min:Array(3).fill(Number.POSITIVE_INFINITY),
		max:Array(3).fill(Number.NEGATIVE_INFINITY)
	});
}

function createPixelTexture(gl,pixel){
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D,texture);
	gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(pixel));
	return texture;
}

function createTexture(gl,url){
	const texture = createPixelTexture(gl,[128,192,255,255]);
	const image = new Image();
	image.src = url;
	image.addEventListener('load',function(){
		info("Image Loaded:"+image.width + " "+ image.height + " " + image.src);
		gl.bindTexture(gl.TEXTURE_2D,texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
		if(isPowerOf2(image.width)&&isPowerOf2(image.height)){
			gl.generateMipmap(gl.TEXTURE_2D);
		}else{
			gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
		}

	});
	return texture; // { texture: texture, image: image};
}

function isPowerOf2(value){
	return (value & (value - 1)) === 0;
}

function makeIndexIterator(indices) {
  let ndx = 0;
  const fn = () => indices[ndx++];
  fn.reset = () => { ndx = 0; };
  fn.numElements = indices.length;
  return fn;
}

function makeUnindexedIterator(positions) {
  let ndx = 0;
  const fn = () => ndx++;
  fn.reset = () => { ndx = 0; };
  fn.numElements = positions.length / 3;
  return fn;
}

const subtractVector2 = (a, b) => a.map((v, ndx) => v - b[ndx]);

function generateTangents(position, texcoord, indices) {
  const getNextIndex = indices ? makeIndexIterator(indices) : makeUnindexedIterator(position);
  const numFaceVerts = getNextIndex.numElements;
  const numFaces = numFaceVerts / 3;

  const tangents = [];
  for (let i = 0; i < numFaces; ++i) {
    const n1 = getNextIndex();
    const n2 = getNextIndex();
    const n3 = getNextIndex();

    const p1 = position.slice(n1 * 3, n1 * 3 + 3);
    const p2 = position.slice(n2 * 3, n2 * 3 + 3);
    const p3 = position.slice(n3 * 3, n3 * 3 + 3);

    const uv1 = texcoord.slice(n1 * 2, n1 * 2 + 2);
    const uv2 = texcoord.slice(n2 * 2, n2 * 2 + 2);
    const uv3 = texcoord.slice(n3 * 2, n3 * 2 + 2);

    const dp12 = m4.subtractVectors(p2, p1);
    const dp13 = m4.subtractVectors(p3, p1);

    const duv12 = subtractVector2(uv2, uv1);
    const duv13 = subtractVector2(uv3, uv1);

    const f = 1.0 / (duv12[0] * duv13[1] - duv13[0] * duv12[1]);
    const tangent = Number.isFinite(f)
      ? m4.normalize(m4.scaleVector(m4.subtractVectors(
          m4.scaleVector(dp12, duv13[1]),
          m4.scaleVector(dp13, duv12[1]),
        ), f))
      : [1, 0, 0];

    tangents.push(...tangent, ...tangent, ...tangent);
  }

  return tangents;
}

function getAccessorAndWebGLBuffer(gl,gltf,accessorIndex){
	const accessor = gltf.accessors[accessorIndex];
	const bufferView= gltf.bufferViews[accessor.bufferView];
	if(bufferView.webglBuffer){
		const buffer = gl.createBuffer();
		const target = bufferView.target || gl.ARRAY_BUFFER;
		const arrayBuffer = gltf.buffers[bufferView.buffer];
		const data = new Uint8Array(arrayBuffer, bufferView.byteOffset, bufferView.byteLengt);
		gl.bindBuffer(target,buffer);
		gl.bufferData(target,data,gl.STATIC_DRAW);
		bufferView.webglBuffer= buffer;
	}
	return {
		accessor,
		buffer: bufferView.webglBuffer,
		stride: bufferView.stride || 0,
	};
}

function throwNoKey(key){
	throw new Error (`no key: ${key}`);
}

const accessorTypeToNumComponentsMap = {
	'SCALAR':1,
	'VEC2':2,
	'VEC3':3,
	'VEC4':4,
	'MAT2':4,
	'MAT3':9,
	'MAT4':16,
};

function accessorTypeToNumComponents(type){
	return accessorTypeToComponentsMap[type] || throwNoKey(type);
}

window.webglUtils = (function(){

	return {
		firstLoop : true,
		endFirstLoop:function(){
			this.firstLoop = false;
		},
		degToRad:function(d){
			return d * Math.PI / 180 ;
		},
		rand:function(min,max){
			return Math.random()*(max-min)+min;
		},
		emod:function(x,n){
			return x >= 0 ? (x % n):((n-(-x%n))%n);
		},
		drawBufferInfo:drawBufferInfo,
		setAttributes:setAttributes,
		setBuffersAndAttributes:setBuffersAndAttributes,
		createAttributeSetters,
		getBindPointForSamplerType,
		createUniformSetters,
		setUniforms,
		createShader,
		createProgram,
		augmentTypedArray,
		guessNumComponentsFromName,
		createAugmentedTypedArray,
		makeTypedArray,
		isArrayBuffer,
		createBufferFromTypedArray,
		allButIndices,
		createMapping,
		getGLTypeForTypedArray,
		getNormalizationForTypedArray,
		getArray,
		getNumComponents,
		getNumElementsFromNonIndexedArrays,
		createAttribsFromArrays,
		createBuffersFromArrays,
		createBufferInfoFromArrays,
		getExtents,
		getGeometriesExtents,
		createPixelTexture,
		createTexture,
		isPowerOf2,
		makeIndexIterator,
		makeUnindexedIterator,
		generateTangents,
		getAccessorAndWebGLBuffer,
		throwNoKey,
		accessorTypeToNumComponents,
	};
}());
