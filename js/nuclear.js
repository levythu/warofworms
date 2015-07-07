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
var st_nuclearSize;	//导弹贴图尺寸
var st_nuclearCentre={};	//导弹判定中心
var st_nuclearBody={};	//导弹身体信息
var st_nuclearColor;	//导弹贴图
var st_nuclearBlastRadius=140;	//爆炸半径
var st_nucblastForce=7000;	//炸飞速度
var st_nucmaxInjury=70;	//爆炸威力

function nuclear_OnDraw(context)	//导弹绘制，并根据速度确定方向角
{
	this.count++;
	if (this.position[1]<=MAP_MARGIN) return;
	var posX=Math.round(this.position[0])-st_nuclearCentre.width+1;
	var posY=Math.round(this.position[1])-st_nuclearCentre.height+1;
	var ag=Math.atan(this.velocity[1]/this.velocity[0]);
	if (this.count % Math.round(FPS/8)==0)
	{
		var smk=new smoke(10,"gray",0);
		smk.onSpawn(posX,posY);
		globalObjects.push(smk);
	}
	context.save();
	context.translate(posX,posY);
	context.rotate(ag);
	if (this.velocity[0]<0) context.scale(-1,1);
	context.translate(-st_nuclearSize.cx,-st_nuclearSize.cy);
	context.drawImage(st_nuclearColor,0,0);
	context.restore();
}
function nuclear_OnSpawn(x,y,angle,force,dirConst)	//in rad，导弹发射
{
	$("#bkfr")[0].pause();
	$("#bkfr")[0].currentTime=0;
	$("#bkfr")[0].play();
	console.log(force);
	this.count=0;
	this.position[0]=x;
	this.position[1]=y;
	this.velocity[0]=dirConst*(this.flyMax*force/100)*Math.cos(angle);
	this.velocity[1]=-(this.flyMax*force/100)*Math.sin(angle);
	console.log(this);
}
function nuclear_Blast()	//爆炸，毁坏范围内地形以及炸飞范围内玩家
{
	function calc_Euclid_Dis(pos1,pos2)
	{
		return Math.sqrt((pos1[0]-pos2[0])*(pos1[0]-pos2[0])+(pos1[1]-pos2[1])*(pos1[1]-pos2[1]));
	}
	var blastCentre=[];
	var force;
	var tantPis=0;
	blastCentre[0]=Math.round(this.position[0]);
	blastCentre[1]=Math.round(this.position[1]);
	shakezoom(30);
	for (var i=0;i<globalPlayerCount;i++)
	{
		tantPis=calc_Euclid_Dis(this.position,globalObjects[i].position);
		if (Math.floor(tantPis)<=st_nuclearBlastRadius)
		{
			var stantPis=tantPis;
			if (stantPis<0.1) force=st_nucblastForce/0.1;
			else force=st_nucblastForce/stantPis;
			if (tantPis!=0)
			{
				globalObjects[i].velocity[0]+=force*(globalObjects[i].position[0]-this.position[0])/tantPis;
				globalObjects[i].velocity[1]+=force*(globalObjects[i].position[1]-this.position[1])/tantPis;
			}
			//damage;
			globalObjects[i].onHit(Math.abs(Math.round((1-tantPis/st_nuclearBlastRadius)*st_nucmaxInjury*this.powerC)));
		}
	}
	var y1;
	for (var i=-st_nuclearBlastRadius;i<=st_nuclearBlastRadius;i++)
	{
		y1=Math.round(Math.sqrt(st_nuclearBlastRadius*st_nuclearBlastRadius-i*i));
		for (var j=-y1;j<=y1;j++)
		{
			if (Math.random()>0.995)
			{
				var smk=new smoke(10,(Math.random()>0.6?"gray":"red"),Math.random()*20-40);
				smk.onSpawn(blastCentre[0]+j,blastCentre[1]+i,Math.random()*1.5);
				globalObjects.push(smk);
			}
			if (blastCentre[1]+i<=HEIGHT-MAP_MARGIN)
				globalTerrain.ruin[blastCentre[1]+i][blastCentre[0]+j]=true;
		}
	}
	refreshTerrain(blastCentre[0]-st_nuclearBlastRadius,blastCentre[1]-st_nuclearBlastRadius,st_nuclearBlastRadius*2+1,st_nuclearBlastRadius*2+1);
}
function nuclear_OnCrush()	//受冲撞爆炸
{
	this.canEliminate=true;
	var i=0;
	while (i<3 && (!($(".bknuexp")[i].ended || $(".bknuexp")[i].paused))) i++;
	$(".bknuexp")[i].pause();
	$(".bknuexp")[i].currentTime=0;
	$(".bknuexp")[i].play();
	this.blast();
}
function nuclear(id,pwd)	//导弹类构造函数，参数二为威力加成
{
	if (pwd==undefined)
		this.powerC=1;
	else
		this.powerC=pwd;
	this.type="entity";
	this.id=id;
	this.g=150;
	this.windVul=0.2;
	this.flyMax=700;
	this.body=st_nuclearBody;
	this.size=st_nuclearSize;
	this.centre=st_nuclearCentre;
	this.position=[0,0];
	this.velocity=[0,0];
	this.count=0;
	this.canEliminate=false;
	this.blast=nuclear_Blast;
	this.onDraw=nuclear_OnDraw;
	this.onSpawn=nuclear_OnSpawn;
	this.onCrush=nuclear_OnCrush;
}
function initNuclear()	//加载导弹贴图
{
	$.get("file/entity/nuclear/info.json",function(data)
	{
		if (typeof(data)=="object")
			st_nuclearSize=data;
		else
			st_nuclearSize=JSON.parse(data);
		st_nuclearBody=new Array(st_nuclearSize.width);
		st_nuclearCentre.width=Math.round(st_nuclearSize.width/2);
		st_nuclearCentre.height=Math.round(st_nuclearSize.height/2);
		for (var i=0;i<st_nuclearSize.height;i++)
			st_nuclearBody[i]=[];
		var img=new Image;
		img.onload=function()
		{
			var canvas=$("#hideCan")[0];
			var context=canvas.getContext("2d");
			context.clearRect(0,0,100,100);
			context.drawImage(this, 0, 0);
			st_nuclearColor=this;
			/*
			var x=0,y=0;
			for (var i=0;i<data.length;i+=4)
			{
				st_nuclearBody[x][y]=false;
				if ()
				y++;
				if (y==st_nuclearSize.width)
				{
					x++;
					y=0;
				}
			}*/
			for (var i=0;i<st_nuclearSize.height;i++)
				for (var j=0;j<st_nuclearSize.width;j++)
					st_nuclearBody[i][j]=(i<3 && j<3);
			moduleCompleted++;
			console.log("nuclear");
		}
		img.src="file/entity/nuclear/pic.png"
	})
}
