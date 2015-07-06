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
var st_smoke_img={};	//烟贴图

function smoke_OnDraw(context)	//绘制烟
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
	context.translate(-st_smoke_img[this.kind].width,-st_smoke_img[this.kind].height);
	context.drawImage(st_smoke_img[this.kind],0,0);
	context.restore();
}
function smoke_OnSpawn(x,y,lt)	//in rad - 烟出生
{
	this.position[0]=x;
	this.position[1]=y;
	this.count=0;	//已经过的时间
	if (lt==undefined) 
		this.lifeTime=1;	//总时间，过后该对象便消失
	else
		this.lifeTime=lt;
}
function smoke(id,kind,vex)	//烟的构造函数,kind决定颜色
{
	this.type="anime";
	this.id=id;
	this.kind=kind;
	this.g=-190;
	this.windVul=0;
	this.position=[0,0];
	this.velocity=[0,0];
	this.velocity[0]=vex;
	
	this.count=0;
	this.lifeTime=1;
	this.alpha=3;
	this.canEliminate=false;
	this.onDraw=smoke_OnDraw;
	this.onSpawn=smoke_OnSpawn;
}
function initSmoke()	//初始化贴图
{
	st_smoke_img.gray=new Image;
	st_smoke_img.gray.onload=function()
	{
		st_smoke_img.red=new Image;
		st_smoke_img.red.onload=function()
		{
			moduleCompleted++;
			console.log("smoke");
		}
		st_smoke_img.red.src="file/entity/smoke/pic2.png";
	}
	st_smoke_img.gray.src="file/entity/smoke/pic.png";
}