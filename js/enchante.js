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
var st_enchante_img={};	//魔法贴图
var st_enchante_energy={p20:65,p50:130,x3:130};	//魔法所需体力

function enchante_OnDraw(context)	//绘制
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
	context.translate(-st_enchante_img[this.name].width,-st_enchante_img[this.name].height);
	context.drawImage(st_enchante_img[this.name],0,0);
	context.restore();
}
function enchante_OnSpawn(x,y)	//in rad，出生
{
	this.position[0]=x;
	this.position[1]=y;
	this.count=0;
	this.lifeTime=1.5;
}
function enchante(id,name)	//魔法类构造函数，玩家使用魔法时的视觉效果
{
	this.type="anime";
	this.id=id;
	this.name=name;
	this.g=-20;
	this.windVul=0;
	this.position=[0,0];
	this.velocity=[0,0];
	
	this.count=0;
	this.lifeTime=1.5;
	this.canEliminate=false;
	this.onDraw=enchante_OnDraw;
	this.onSpawn=enchante_OnSpawn;
}
function initEnchante(name)	//加载魔法贴图
{
	st_enchante_img[name]=new Image;
	st_enchante_img[name].onload=function()
	{
		moduleCompleted++;
	}
	st_enchante_img[name].src="file/enchant/"+name+".png";
}