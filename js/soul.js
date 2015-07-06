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

var st_soul_img;	//灵魂贴图

function soul_OnDraw(context)	//绘制灵魂
{
	if (this.position[1]<=MAP_MARGIN) 
	{
		this.canEliminate=true;
		return;
	}
	var posX=Math.round(this.position[0]);
	var posY=Math.round(this.position[1]);
	context.save();
	context.translate(posX,posY);
	context.translate(-st_soul_img.width,-st_soul_img.height);
	context.drawImage(st_soul_img,0,0);
	context.restore();
}
function soul_OnSpawn(x,y)		//灵魂出生
{
	this.position[0]=x;
	this.position[1]=y;
}
function soul(id)	//灵魂构造函数，玩家死亡时放置，向上飞。
{
	this.type="anime";
	this.id=id;
	this.g=-150;
	this.windVul=0;
	this.position=[0,0];
	this.velocity=[0,0];
	this.canEliminate=false;
	this.onDraw=soul_OnDraw;
	this.onSpawn=soul_OnSpawn;
}
function initSoul()	//加载贴图
{
	st_soul_img=new Image;
	st_soul_img.onload=function()
	{
		moduleCompleted++;
	}
	st_soul_img.src="file/player/dd.png";
}