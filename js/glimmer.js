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
var st_glimmer_img={};	//烟贴图

function glimmer_OnDraw(context)	//绘制烟
{
	this.count+=1/FPS;
	if (this.lifeTime<=this.count)
	{
		this.canEliminate=true;
		return;
	}
	if (this.position[1]<=MAP_MARGIN) return;
	this.velocity[0]=Math.round(this.velocity[0]*0.95+Math.random()*10-5);
	this.velocity[1]=Math.round(this.velocity[1]*0.95+Math.random()*10-5);
	var posX=Math.round(this.position[0]);
	var posY=Math.round(this.position[1]);


	context.save();
	context.translate(posX,posY);
	context.translate(-st_glimmer_img[this.kind].width,-st_glimmer_img[this.kind].height);
	context.drawImage(st_glimmer_img[this.kind],0,0);
	context.restore();
}
function glimmer_OnSpawn(x,y,lt,vx,vy)	//in rad - 烟出生
{
	this.position[0]=x;
	this.position[1]=y;
	this.velocity[0]=vx;
	this.velocity[1]=vy;
	this.count=0;	//已经过的时间
	if (lt==undefined)
		this.lifeTime=1;	//总时间，过后该对象便消失
	else
		this.lifeTime=lt;
}
function glimmer(id,kind,vex)	//烟的构造函数,kind决定颜色
{
	this.type="anime";
	this.id=id;
	this.kind=kind;
	this.g=0;
	this.windVul=0;
	this.position=[0,0];
	this.velocity=[0,0];
	this.velocity[0]=vex;

	this.count=0;
	this.lifeTime=1;
	this.alpha=3;
	this.canEliminate=false;
	this.onDraw=glimmer_OnDraw;
	this.onSpawn=glimmer_OnSpawn;
}
function initGlimmer()	//初始化贴图
{
	st_glimmer_img.green=new Image;
	st_glimmer_img.green.onload=function()
	{
		st_glimmer_img.red=new Image;
		st_glimmer_img.red.onload=function()
		{
			moduleCompleted++;
			console.log("glimmer");
		}
		st_glimmer_img.red.src="file/entity/glimmer/green.png";
	}
	st_glimmer_img.green.src="file/entity/glimmer/green.png";
}
