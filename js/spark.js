//烂尾的对象... 原设定为炸坏地形产生的火花
//*******************************************
//An object should contain the following attributes:
//---type:(player, entity)
//---position:[X,Y]
//---velocity:[X,Y]
//---windVul:num;
//---g:num;
//---onDraw:function
//---onCrush:function
//------for a player, it should contain:
//------id:num
//------health:num
//------status:(stand,fly,dead)
//------inventory:[]
//------onHit:function
//------onDie:function
//------onSpawn:function
//------onOperation:funciton
//------...
//---------for a entity, is should contain:
//---------body: Array[bool]
//---------timeout: num
//---------onTimeout:function
//---------onSpawn:function
//*******************************************
//Levy. Jul 13.
/*
var st_smoke_img;

function smoke_OnDraw(context)
{
	this.count+=1/FPS;
	if (this.lifeTime<=this.count)
	{
		this.canEliminate=true;
		return;
	}
	if (this.position[1]<=MAP_MARGIN) return;
	var posX=Math.round(this.position[0]);
	var posY=Math.round(this.position[1]);
	context.save();
	context.translate(posX,posY);
	context.rotate(this.count*this.alpha);
	context.translate(-st_smoke_img.width,-st_smoke_img.height);
	context.drawImage(st_smoke_img,0,0);
	context.restore();
}
function smoke_OnSpawn(x,y)	//in rad
{
	this.position[0]=x;
	this.position[1]=y;
	this.count=0;
	this.lifeTime=1;
}
function smoke(id)
{
	this.type="anime";
	this.id=id;
	this.g=-190;
	this.windVul=0;
	this.position=[0,0];
	this.velocity=[0,0];
	this.count=0;
	this.lifeTime=1;
	this.alpha=3;
	this.canEliminate=false;
	this.onDraw=smoke_OnDraw;
	this.onSpawn=smoke_OnSpawn;
}
function initSmoke()
{
	st_smoke_img=new Image;
	st_smoke_img.onload=function()
	{
		//ATTENTION
	}
	st_smoke_img.src="file/entity/smoke/pic.png";
}*/