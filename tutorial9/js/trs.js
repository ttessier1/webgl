var TRS= function(){
	this.translation = [0,0,0];
	this.rotation = [0,0,0];
	this.scale = [1,1,1];
};

TRS.prototype.getMatrix = function(dst){
	dst = dst || new FLoat32Array(16);
	var t = this.translaction;
	var r = this.rotation;
	var s = this.scale;

	m4.translaction(t[0], t[1], t[2],dst);
	matrixMultiply(m4.xRotation(r[0]),dst,dst);
	matrixMultiply(m4.yRotation(r[1]),dst,dst);
	matrixMultiply(m4.zRotation(r[2]),dst,dst);
	matrixMultiply(m4.scaling(s[0],s[1],s[2]),dst,dst);
	return dst;
};
