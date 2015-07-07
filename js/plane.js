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
var st_planeSize;	//导弹贴图尺寸
var st_planeCentre={};	//导弹判定中心
var st_planeBody={};	//导弹身体信息
var st_planeColor;	//导弹贴图
var st_planeBlastRadius=140;	//爆炸半径
var st_flycblastForce=5000;	//炸飞速度
var st_flymaxInjury=50;	//爆炸威力

function plane_OnDraw(context)	//导弹绘制，并根据速度确定方向角
{
	this.count++;
	if (this.position[1]<=MAP_MARGIN) return;
	var posX=Math.round(this.position[0])-st_planeCentre.width+1;
	var posY=Math.round(this.position[1])-st_planeCentre.height+1;
	var ag=Math.atan(this.velocity[1]/this.velocity[0]);

	context.save();
	context.translate(posX,posY);
	context.rotate(ag);
	if (this.velocity[0]<0) context.scale(-1,1);
	context.translate(-st_planeSize.cx,-st_planeSize.cy);
	context.drawImage(st_planeColor,0,0);
	context.restore();
}
function plane_OnSpawn(x,y,angle,force,dirConst)	//in rad，导弹发射
{
	$("#bkfly")[0].pause();
	$("#bkfly")[0].currentTime=0;
	$("#bkfly")[0].play();
	console.log(force);
	this.count=0;
	this.position[0]=x;
	this.position[1]=y;
	this.velocity[0]=dirConst*(this.flyMax*force/100)*Math.cos(angle);
	this.velocity[1]=-(this.flyMax*force/100)*Math.sin(angle);
	console.log(this);
}
function plane_Blast()	//爆炸，毁坏范围内地形以及炸飞范围内玩家
{
}
function plane_OnCrush()	//受冲撞爆炸
{
	this.canEliminate=true;
	$("#bkland")[0].pause();
	$("#bkland")[0].currentTime=0;
	$("#bkland")[0].play();

	var posX=Math.round(this.position[0])-st_planeCentre.width+1;
	var posY=Math.round(this.position[1])-st_planeCentre.height+1;
	for (var i=0;i<60;i++)
	{
		var gli=new glimmer(10,"green",0);
		gli.onSpawn(posX,posY,1,Math.round(Math.random()*240-120),Math.round(Math.random()*240-120));
		globalObjects.push(gli);
	}

	this.sender.position[0]=this.position[0];
	this.sender.position[1]=this.position[1]-5;
}
function plane(id,pwd,sender)	//导弹类构造函数，参数二为威力加成
{
	if (pwd==undefined)
		this.powerC=1;
	else
		this.powerC=pwd;
	this.type="entity";
	this.id=id;
	this.g=150;
	this.windVul=10;
	this.flyMax=700;
	this.body=st_planeBody;
	this.size=st_planeSize;
	this.centre=st_planeCentre;
	this.position=[0,0];
	this.velocity=[0,0];
	this.count=0;
	this.canEliminate=false;
	this.blast=plane_Blast;
	this.onDraw=plane_OnDraw;
	this.onSpawn=plane_OnSpawn;
	this.onCrush=plane_OnCrush;
	this.sender=sender;
}
function initPlane()	//加载导弹贴图
{
	$.get("file/entity/plane/info.json",function(data)
	{
		if (typeof(data)=="object")
			st_planeSize=data;
		else
			st_planeSize=JSON.parse(data);
		st_planeBody=new Array(st_planeSize.width);
		st_planeCentre.width=Math.round(st_planeSize.width/2);
		st_planeCentre.height=Math.round(st_planeSize.height/2);
		for (var i=0;i<st_planeSize.height;i++)
			st_planeBody[i]=[];
		var img=new Image;
		img.onload=function()
		{
			var canvas=$("#hideCan")[0];
			var context=canvas.getContext("2d");
			context.clearRect(0,0,100,100);
			context.drawImage(this, 0, 0);
			st_planeColor=this;
			/*
			var x=0,y=0;
			for (var i=0;i<data.length;i+=4)
			{
				st_planeBody[x][y]=false;
				if ()
				y++;
				if (y==st_planeSize.width)
				{
					x++;
					y=0;
				}
			}*/
			for (var i=0;i<st_planeSize.height;i++)
				for (var j=0;j<st_planeSize.width;j++)
					st_planeBody[i][j]=(i<3 && j<3);
			moduleCompleted++;
			console.log("plane");
		}
		img.src="file/entity/plane/pic.png"
	})
}
