var TRS= function(name){
	this.translation = [0,0,0];
	this.rotation = [0,0,0];
	this.scale = [1,1,1];
	this.firstLoop = true;
	if(typeof ( name ) == "string"){
		this.name = name;
	}else{
		this.name = "Unknown Object:" + Math.random();
	}
};

TRS.prototype.getMatrix = function(dst){
	try{
	dst = dst || new FLoat32Array(16);
	var t = this.translation;
	var r = this.rotation;
	var s = this.scale;

	m4.translation(t[0], t[1], t[2],dst);
	m4.xRotate(dst,parseFloat(r[0]),dst);
	m4.yRotate(dst,parseFloat(r[1]),dst);
	m4.zRotate(dst,parseFloat(r[2]),dst);

	m4.scale(dst,s[0],s[1],s[2],dst);
	return dst;
	}catch (err){
		error("Error:"+err.message+" for TRS:"+this.name);
	}
	this.firstLoop = false;
};
