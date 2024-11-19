async function doLoad(gl,skinProgramInfo,url){
	var gltf = await this.loadJSON(url);
	const bURL = new URL(url,location.href);
	info("BaseUrl:"+bURL.href);
	gltf.buffers = await Promise.all(gltf.buffers.map((buffer) => {
		const url = new URL(buffer.uri,bURL.href);
		info("Loading Additional Url:"+url);
		return this.loadBinary(url.href);
	}));

	const defaultMaterial = {
		uniforms:{
			u_diffuse: [.5,.8,1,1],
		},
	};


	gltf.meshes.forEach((mesh) => {
		mesh.primitives.forEach((primitive)=>{
			const attribs = {};
			let numElements = 0 ;
			for(const [attribName,index] of Object.entries(primitive.attributes)){
				const {accessor,buffer,stride}= this.getAccessorAndWebGLBuffer(gl,gltf,index);
				numElements = accessor.count;
				attribs[`a_${attribName}`] = {
					buffer,
					type: accessor.componentType,
					numComponents: accessorTypeToNumComponents(accessor.type),
					stride,
					offset: accessor.byteOffset|0,
				};
			}
			const bufferInfo = {
				attribs,
				numElements,
			};

			if(primitive.indices !== undefined){
				const {accessor,buffer} = this.getAccessorAndWebGLBuffer(gl,gltf,primitive.indices);
				bufferInfo.numElements= accessor.count;
				bufferInfo.indices = buffer;
				bufferInfo.elementType = accessor.componentType;
			}

			primitive.bufferInfo = bufferInfo;
			primitive.material = gltf.materials && gltf.materials[primitive.material] ||defaultMaterial;
		});
	});

	for(const {channels,name,samplers} of gltf.animations){
		info ("Animation:"+name);
		for ( const {sampler,target} of channels){
			info("Sample:"+sampler+ " Using Node:"+target.node+"["+gltf.nodes[target.node].name+"] which is a:"+target.path);
			info("Sampler:"+samplers[sampler].input+" Interpolation:"+samplers[sampler].interpolation+" Output:"+samplers[sampler].output);
			if(target.path == "translation" ){
				info("Initial Translation:"+gltf.nodes[target.node].translation);
			}else if ( target.path == "rotation" ){
				info("Initial Rotation:"+gltf.nodes[target.node].rotation);
			}
			var animationInfo={
				bufferTimeInfo: this.getAccessorTypedArrayAndStride(gl,gltf,samplers[sampler].input),
				numInputElements: gltf.accessors[samplers[sampler].input].count,
				bufferOutputInfo: this.getAccessorTypedArrayAndStride(gl,gltf,samplers[sampler].output),
				numOutputElements: gltf.accessors[samplers[sampler].output].count,
				
			};
			info("Accessor:Type:"+gltf.accessors[samplers[sampler].input].type+" ComponentType:"+ glTypeToTypedArray(gltf.accessors[samplers[sampler].input].componentType)+ " "+gltf.accessors[samplers[sampler].input].count+" BufferView:"+gltf.accessors[samplers[sampler].input].bufferView+" byteOffset:"+(gltf.accessors[samplers[sampler].input].byteOffset||0));
			info("BufferView: buffer:"+ gltf.bufferViews[gltf.accessors[samplers[sampler].input].bufferView].buffer);
			info("BufferView: byteLength:"+ gltf.bufferViews[gltf.accessors[samplers[sampler].input].bufferView].byteLength);
			info("BufferView: byteOffset:"+ gltf.bufferViews[gltf.accessors[samplers[sampler].input].bufferView].byteOffset);
			info("Buffer:"+gltf.buffers[gltf.bufferViews[gltf.accessors[samplers[sampler].input].bufferView].buffer]);
			info("Output Type:"+gltf.accessors[samplers[sampler].output].type);

			var jj = 0 ;
			switch(gltf.accessors[samplers[sampler].output].type){
				case "VEC3":
					jj=0;
					for(let ii=0; ii<animationInfo.bufferTimeInfo.array.length;ii++){
						info("Time: "+ii+" = "+animationInfo.bufferTimeInfo.array[ii]+" Output:"+jj+" = "+animationInfo.bufferOutputInfo.array[jj]+","+animationInfo.bufferOutputInfo.array[jj+1]+","+animationInfo.bufferOutputInfo.array[jj+2]);
						jj+=3
					}
				break;
				case "VEC4":
					jj=0;
					for(let ii=0; ii<animationInfo.bufferTimeInfo.array.length;ii++){
						info("Time: "+ii+" = "+animationInfo.bufferTimeInfo.array[ii]+" Output:"+jj+" = "+animationInfo.bufferOutputInfo.array[jj]+","+animationInfo.bufferOutputInfo.array[jj+1]+","+animationInfo.bufferOutputInfo.array[jj+2]+","+animationInfo.bufferOutputInfo.array[jj+3]);
						jj+=4;
					}
				break;
				default:
					warn("Unhandled type:"+ gltf.accessors[samplers[sampler].output].type);
				break;
			}
		}

	}

	const skinNodes = [];
	const origNodes = gltf.nodes;

	gltf.nodes= gltf.nodes.map((n)=>{
		const {name,skin,mesh,translation,rotation,scale} = n;
		const trs = new TRS(name,translation,rotation,scale);
		const node = new Node(trs,name);
		const realMesh = gltf.meshes[mesh];
		if(skin!==undefined && realMesh){
			info("Adding Skin for:"+name);
			skinNodes.push({node,mesh:realMesh,skinNdx:skin});
		}else if(realMesh){
			info("Not Using Skin for:"+name);
			node.drawables.push(new MeshRenderer(realMesh));
		}
		return node;
	});

	gltf.skins = gltf.skins.map((skin) => {
		const joints = skin.joints.map(ndx=> gltf.nodes[ndx]);
		const {stride,array} = this.getAccessorTypedArrayAndStride(gl,gltf,skin.inverseBindMatrices);
		return new Skin(gl,joints,array);
	});

	for(const {node,mesh,skinNdx} of skinNodes){
		node.drawables.push(new SkinRenderer(gl,skinProgramInfo,mesh,gltf.skins[skinNdx]));
	}

	gltf.nodes.forEach((node,ndx) =>{
		const children = origNodes[ndx].children;
		if(children){
			this.addChildren(gltf.nodes,node, children);
		}
	});

	for ( const scene of gltf.scenes ){
		scene.root = new Node(new TRS(scene.name),scene.name);
		this.addChildren(gltf.nodes,scene.root,scene.nodes);
	}

	return gltf;
}


window.gltfParser = (function(){
	return {
		loadGltf:doLoad,
		loadFile: async function(url,typeFunc){
			const myRequest= new Request(url);
			return await window.fetch(myRequest)
			.then((response)=>{
				if(!response.ok){
					throw new Error ( `Could not load gltf ${url}`);
					return null;
				}
				return response;
			})
			.then((response)=>response[typeFunc]())
			.then((response)=>{
				console.log(response);
				console.log("Returning Type:"+typeFunc);
				console.log(response);
				return response;
			});
		},
		loadBinary:async function(url){
			return await this.loadFile(url,'arrayBuffer');
		},
		loadJSON:async function(url){
			return await this.loadFile(url,'json');
		},
		addChildren:function(nodes,node,childIndices){
			childIndices.forEach((childNdx)=>{
				const child = nodes[childNdx];
				child.setParent(node);
			});
		},
		getAccessorAndWebGLBuffer:function(gl,gltf,accessorIndex){
			const accessor = gltf.accessors[accessorIndex];
			const bufferView = gltf.bufferViews[accessorIndex];
			if(!bufferView.webglBuffer){
				const buffer = gl.createBuffer();
				const target = bufferView.target || gl.ARRAY_BUFFER;
				const arrayBuffer = gltf.buffers[bufferView.buffer];
				const data = new Uint8Array(arrayBuffer,bufferView.byteOffset,bufferView.byteLength);
				gl.bindBuffer(target,buffer);
				gl.bufferData(target,data,gl.STATIC_DRAW);
				bufferView.webglBuffer = buffer;
			}
			return {
				accessor,
				buffer: bufferView.webglBuffer,
				stride: bufferView.stride||0,
			};
		},
		getAccessorTypedArrayAndStride:function(gl,gltf,accessorIndex){
			const accessor = gltf.accessors[accessorIndex];
			const bufferView = gltf.bufferViews[accessor.bufferView];
			const TypedArray = glTypeToTypedArray(accessor.componentType);
			const buffer = gltf.buffers[bufferView.buffer];
			return {
				accessor,
				array:new TypedArray(
					buffer,
					bufferView.byteOffset + (accessor.byteOffset||0),
					accessor.count*accessorTypeToNumComponents(accessor.type)),
				stride:bufferView.byteStride||0,
			}
		},

	};
}());
