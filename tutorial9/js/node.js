var Node = function(name,source){
	console.log("Type of name:"+typeof(name));
	if ( typeof(name) == "string"){
		this.name = name;
	}else{
		this.name = "Unnamed Object "+Math.random();
	}
	this.children = [];
	this.localMatrix = m4.identity();
	this.worldMatrix = m4.identity();
	this.source= source;
	this.firstLoop = true;
};

Node.prototype.setParent = function(parent){
	// remove us from our parent
	if(this.parent){
		var ndx= this.parent.children.indexOf(this);
		if(ndx >= 0){
			this.parent.children.splice(ndx,1);
		}
	}
	if(parent){
		parent.children.push(this);
	}
	this.parent = parent;
};

Node.prototype.updateWorldMatrix = function(parentWorldMatrix){
	if(this.firstLoop)console.log("UpdateWorldMatrix:"+this.name);
	var source=this.source;
	if(source){
		source.getMatrix(this.localMatrix);
	}
	if(parentWorldMatrix){
		if(this.firstLoop)console.log("ParentWorldMatrix:"+parentWorldMatrix);
		m4.multiply(parentWorldMatrix,this.localMatrix,this.worldMatrix);
	} else {
		if(this.firstLoop)console.log("ParentWorldMatrid[worldMatrix]:"+this.worldMatrix);
		m4.copy(this.localMatrix,this.worldMatrix);
	}
	var worldMatrix = this.worldMatrix;
	this.children.forEach(function(child){
		child.updateWorldMatrix(worldMatrix);
	});
	this.firstLoop = false;
};
