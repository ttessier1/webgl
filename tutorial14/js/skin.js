class Skin{
	constructor(gl,joints,inverseBindMatrixData){
		this.firstLoop = true;
		if(this.firstLoop) info("GL inside Skin(construct):"+gl.constructor.name);
		this.joints = joints;
		this.inverseBindMatrices = [];
		this.jointMatrices = [];

		this.jointData = new Float32Array(joints.length*16);

		for(let i = 0;i<joints.length;++i){
			this.inverseBindMatrices.push(new Float32Array(
				inverseBindMatrixData.buffer,
				inverseBindMatrixData.byteOffset+ Float32Array.BYTES_PER_ELEMENT * 16 * i,
				16));
			this.jointMatrices.push(new Float32Array(
				this.jointData.buffer,
				Float32Array.BYTES_PER_ELEMENT*16*i,
				16));
				

		}
		this.jointTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D,this.jointTexture);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
	}
	update(gl,node){
		if(this.firstLoop) info("GL inside Skin(update):"+gl.constructor.name);
		const globalWorldInverse = m4.inverse(node.worldMatrix);
		for(let j = 0;j<this.joints.length; ++j){
			const joint = this.joints[j];
			const dst = this.jointMatrices[j];
			m4.multiply(globalWorldInverse,joint.worldMatrix,dst);
			m4.multiply(dst,this.inverseBindMatrices[j],dst);
		}
		gl.bindTexture(gl.TEXTURE_2D,this.jointTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,4,this.joints.length,0,
			gl.RGBA,gl.FLOAT,this.jointData);
		if(this.firstLoop) info("GL inside Skin(update):"+gl.TEXTURE_2D+",0,"+gl.RGBA+",4,"+this.joints.length+",0,"+gl.RGBA+","+gl.FLOAT+","+this.jointData);
		this.firstLoop = false;
	}

}
