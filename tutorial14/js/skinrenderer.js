class SkinRenderer{
	constructor(gl,skinProgramInfo,mesh,skin){
		this.skin = skin;
		this.mesh = mesh;
		this.firstLoop = true;
		this.gl = gl;
		this.skinProgramInfo = skinProgramInfo;
		if(this.firstLoop)info("Skin:"+skin.constructor.name);
		if(this.firstLoop)info("Mesh:"+mesh.constructor.name);
	}
	render(gl,skinProgramInfo,node,projection,view,sharedUniforms){
		const {skin,mesh} = this;
		if(this.firstLoop)info("Skin:"+skin.constructor.name);
		if(this.firstLoop)info("Mesh:"+mesh.constructor.name);
		skin.update(gl,node);
		gl.useProgram(skinProgramInfo.program);
		for(const primitive of mesh.primitives){
			webglUtils.setBuffersAndAttributes(gl,skinProgramInfo,primitive.bufferInfo);
			webglUtils.setUniforms(skinProgramInfo,{
				u_projection: projection,
				u_view: view,
				u_world: node.worldMatrix,
				u_jointTexture: skin.jointTexture,
				u_numJoints: skin.joints.length,
			});
			webglUtils.setUniforms(skinProgramInfo,primitive.material.uniforms);
			webglUtils.setUniforms(skinProgramInfo,sharedUniforms);
			webglUtils.drawBufferInfo(gl,primitive.bufferInfo);
		}
		this.firstLoop = false;
	}
}
