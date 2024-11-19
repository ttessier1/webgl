class MeshRenderer{
	constructor(mesh){
		this.mesh = mesh;
	}

	render(gl,meshProgramInfo,node,projection,view,sharedUniforms){
		const{mesh} = this;
		gl.useProgram(meshProgramInfo.program);
		for(const primitive of mesh.primitives){
			webglUtils.setBuffersAndAttributes(gl,meshProgramInfo,primitive.bufferInfo);
			webglUtils.setUniforms(meshProgramInfo,{
				u_projection: projection,
				u_view: view,
				u_world: node.worldMatrix,
			});
			webglUtils.setUniforms(meshProgramInfo,primitive.material.uniforms);
			webglUtils.setUniforms(meshProgramInfo,sharedUniforms);
			webglUtils.drawBufferInfo(gl,primitive.bufferInfo);
		}
	}
}
