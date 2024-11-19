class TRS{
	constructor(name="",position=[0,0,0],rotation=[0,0,0,1],scale = [1,1,1]){
		this.firstLoop = true;
		this.position = position;
		this.rotation = rotation;
		this.scale = scale;
		if(typeof(name)=="string"){
			this.name = name;
		}else{
			this.name = "Unnamed Object "+ Math.random();
		}
	}


	getMatrix(dst){
		try{
			dst = dst || new Float32Array(16);
			m4.compose(this.position,this.rotation,this.scale,dst);
			return dst;
		}catch (err){
			error("Error:"+err.message+" for TRS:"+this.name);
		}
		this.firstLoop = false;
		return new Float32Array(16);
	}
};
