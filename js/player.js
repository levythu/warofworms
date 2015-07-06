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
//LATEST EDIT: 7/14 22:27
//Levy. Jul 13.
var st_PlayerBuffer={};	//玩家身体贴图
var st_FaceBuffer={};	//玩家脸部贴图
var st_PlayerInfo={};	//玩家判定点信息
var st_PlayerWidth=48;	
var st_PlayerHeight=32;
var st_walkRound=FPS/4-1;	
//走路声刷新时间
function approxGrad(x,y)	//估计当前位置斜率
{
	var delta=0;
	if (globalTerrain.rawData[y][x])
	{
		while (delta>-MAX_GRAD && globalTerrain.rawData[y+delta][x]) delta--;
	}
	else
	{
		while (delta<MAX_GRAD && !globalTerrain.rawData[y+delta][x]) delta++;
		delta--;
	}
	return -delta;
}
function player_OnDraw(context)	//绘制角色函数，根据地形斜率确定面部角度
{
	if (this.position[1]<=MAP_MARGIN) return;
	if (this.status=="die") return;
	var posX=Math.round(this.position[0]);
	var posY=Math.round(this.position[1]);
	/*
	var imageData=context.getImageData(posX-2,posY-3,5,4);
    var data=imageData.data;
	for (var i=0;i<data.length;i++)
	{
		data[4*i+0]=data[4*i+3]=255;
		data[4*i+1]=data[4*i+2]=0;	
	}
	context.putImageData(imageData,posX-2,posY-3);
	*/
	
	
	context.save();
	context.textAlign="center";
	context.font="bold 19px BabyDoll"
	if (this.appear=="red")
		context.fillStyle = "rgba(255,0,0,0.9)";
	else
		context.fillStyle = "rgba(0,155,255,0.9)";
	context.fillText(this.health.toString(), posX, posY-WORD_HEIGHT, WORD_WIDTH);
	if (this.id==globalFocus)
		context.drawImage(st_arrow, posX-5, posY-2*WORD_HEIGHT-5);
	
	context.translate(posX,posY);
	if (this.status!="fly")
	{
		var k=(approxGrad(posX+SAMPLE_RANGE,posY)-approxGrad(posX-SAMPLE_RANGE,posY))/(2*SAMPLE_RANGE);	
		this.faceAngle=-Math.atan(k);
	}
	context.rotate(this.faceAngle);
	if (this.orientation=="l")
	{
		context.scale(-1,1)
	}
	context.save();
	var fx,fy;
	fx=Math.min(Math.abs(this.velocity[0]),400);
	fy=Math.min(Math.abs(this.velocity[1]),400);
	context.scale(1+fx/700,1+fy/700)
    context.drawImage(st_PlayerBuffer[this.appear],-1*st_PlayerInfo[this.appear].cx,-1*st_PlayerInfo[this.appear].cy);
	context.restore();
	context.drawImage(st_FaceBuffer[this.appear],-1*st_PlayerInfo[this.appear].cx,-1*st_PlayerInfo[this.appear].cy);
	
	context.restore();
}
function player_OnSpawn(x,y)	//出生函数
{
	this.position[0]=x;
	this.position[1]=y;
	this.health=MAX_HEALTH;
}
function player_OnCrush()	//撞到地形后的反弹函数
{
	function sgn(num)
	{
		if (num>0) return 1;
		if (num<0) return -1;
		return 0;
	}
	var posX=Math.round(this.position[0]);
	var posY=Math.round(this.position[1]);
	var by=globalTerrain.rawData[posY+sgn(this.velocity[1])][posX],
		bx=globalTerrain.rawData[posY][posX+sgn(this.velocity[0])];
	var cy=globalTerrain.rawData[posY+1][posX],
		cx=globalTerrain.rawData[posY][posX+1],
		dy=globalTerrain.rawData[posY-1][posX],
		dx=globalTerrain.rawData[posY][posX-1];
		
	var k=(approxGrad(posX+SAMPLE_RANGE,posY)-approxGrad(posX-SAMPLE_RANGE,posY))/(2*SAMPLE_RANGE);	
	this.faceAngle=-Math.atan(k);

	
	var tX=this.velocity[0]*this.elaticity,tY=this.velocity[1]*this.elaticity;
	if (this.elaticity==0) 
	{
		this.elaticity=this.elaticity_back;
		this.haveLean=true;
	}
	if (Math.abs(tX)<MIN_SPEED_RECOGNIZED*FPS) tX=0;
	if (Math.abs(tY)<MIN_SPEED_RECOGNIZED*FPS) tY=0;
	if (by) tY*=-1
	if (bx)	tX*=-1;
	if ((cy ^ dy) && (cx ^ dx))
	{
		this.velocity[0]=(cx?-1:1)*Math.abs(tY);
		this.velocity[1]=(cy?-1:1)*Math.abs(tX);
	}
	else
	{
		this.velocity[0]=tX;
		this.velocity[1]=tY;
	}
}
function player_onJump()	//跳跃函数
{
	if (this.energy<12) return;
	this.energy-=12;
	this.velocity[1]-=JUMP_FORCE;
	this.elaticity=0;
	this.haveLean=false;
	$("#bkwk")[0].pause();
	$("#bkwk")[0].currentTime=0;
	$("#bkwk")[0].play();
	if (this.status=="crawl")
	{
		this.velocity[0]+=(this.orientation=="l"?-1*JUMP_LONG:JUMP_LONG);
	}
	this.status="fly";
}
function player_onCrawl(direction)	//'l'-'r' 爬行函数
{
	if (this.energy<1) return;
	this.energy-=1;
	var dirVal=(direction=='l'?-1:1);
	var pX=Math.round(this.position[0]);
	var pY=Math.round(this.position[1]);
	var measure=0;
	this.status="crawl";
	this.orientation=direction;
	while (measure<CANNOT_WALK && globalTerrain.rawData[pY-measure][pX+dirVal]) measure++;
	if (measure>=CANNOT_WALK) return false;
	if (!globalTerrain.rawData[pY][pX+dirVal])
	{
		while (measure>-CANNOT_WALK && !globalTerrain.rawData[pY-measure+1][pX+dirVal]) measure--;
	}
	st_walkRound++
	if (st_walkRound==FPS/4)
	{
		$("#bkwk")[0].pause();
		$("#bkwk")[0].currentTime=0;
		$("#bkwk")[0].play();
		st_walkRound=0;
	}
	this.position[0]+=dirVal;
	this.position[1]-=measure;
	return true;
}
function player_onLean(direction)	//空推函数(即跳起的空中一次变向机会)
{
	if (this.energy<3) return;
	this.energy-=3;
	var dirVal=(direction=='l'?-1:1);
	this.orientation=direction;
	this.haveLean=true;
	this.velocity[0]+=dirVal*LEAN_FORCE;
}
function player_onLaunch(angle,force,is3)	//angle in degree. 发射火箭，第三个参数指明是否为三叉戟副箭
{
	var dirVal=(this.orientation=='l'?-1:1);
	var lauchPlacex=this.position[0]+dirVal*(PLAYER_PIC_WIDTH-st_PlayerInfo[this.appear].cx)*Math.cos(this.faceAngle);
	var lauchPlacey=this.position[1]+dirVal*(PLAYER_PIC_WIDTH-st_PlayerInfo[this.appear].cx)*Math.sin(this.faceAngle)-PLAYER_PIC_HEIGHT/3;
	var atk=1,x3=false;
	if (is3==true)
	{
		atk=0.5;
	}
	else
	{
		for (var i=0;i<this.enchanter.length;i++)
		{
			if (this.enchanter[i]=="p20")
				atk+=0.2;
			if (this.enchanter[i]=="p50")
				atk+=0.5;
			if (this.enchanter[i]=="x3")
				x3=true;
		}
	}
	var miss=new missile(10,atk);
	
	if (x3)
	{
		this.onLaunch(angle-20,force,true);
		this.onLaunch(angle+20,force,true);
	}
	angle=angle*Math.PI/180-dirVal*this.faceAngle;
	miss.onSpawn(lauchPlacex,lauchPlacey,angle,force,dirVal);
	globalObjects.push(miss);
	
	this.operate="idle";
	globalFocus=globalObjects.length-1;
}
function player_onReady()	//蓄力
{
	this.operate="ready";
	if (this.lForce<100)
	{
		this.lForce+=1;
		$("#forceI").css("width",Math.round(5.1*this.lForce));
	}
	else
		this.onLaunch(st_aimer_angle,this.lForce);
}
function player_onHit(injury)	//击中伤血
{
	if (this.status=="die") return;
	this.health-=injury;
	if (this.health<=0) this.onDie();
}
function player_onDie(injury)	//死亡
{
	if (this.status=="die") return;
	this.status="die";
	this.health=0;
	if (this.id==globalFocus)
		nextPlay(-1);
	var i=0;
	while (i<3 && (!($(".bkcw")[i].ended || $(".bkcw")[i].paused))) i++;	
	$(".bkcw")[i].pause();
	$(".bkcw")[i].currentTime=0;
	$(".bkcw")[i].play();
	
	var sl=new soul();
	sl.onSpawn(this.position[0],this.position[1]);
	globalObjects.push(sl);
}
function player_enchantez(type)	//使用道具
{
	if (this.energy<st_enchante_energy[type]) return;
	this.energy-=st_enchante_energy[type];
	var i=0;
	while (i<3 && (!($(".bkpk")[i].ended || $(".bkpk")[i].paused))) i++;
	$(".bkpk")[i].pause();
	$(".bkpk")[i].currentTime=0;
	$(".bkpk")[i].play();
	this.enchanter.push(type);
	
	var sl=new enchante(1,type);
	sl.onSpawn(this.position[0],this.position[1]-50);
	globalObjects.push(sl);
}
function player(id,appear)	//玩家对象的构造函数
{
	this.type="player";
	this.status="stand";
	this.operate="idle";
	this.id=id;
	this.g=220;	//重力加速度
	this.windVul=0;	//风敏感性
	this.position=[0,0];
	this.velocity=[0,0];
	this.orientation="l";
	this.faceAngle=0;
	this.appear=appear;	//决定玩家队伍
	this.canEliminate=false;	
	this.haveLean=true;	//此次跳跃是否空推
	this.onDraw=player_OnDraw;
	this.onSpawn=player_OnSpawn;
	this.onCrush=player_OnCrush;
	this.onJump=player_onJump;
	this.onCrawl=player_onCrawl;
	this.onLean=player_onLean;
	this.onReady=player_onReady;
	this.onLaunch=player_onLaunch;
	this.onHit=player_onHit;
	this.onDie=player_onDie;
	this.onEnchantez=player_enchantez;
	this.enchanter=[];
	this.elaticity=this.elaticity_back=0.4;	//弹性系数
	this.lForce=0;
	this.energy=MAX_ENERGY;
}
function initPlayerPic(name,flagPos)	//加载贴图
{
	st_PlayerBuffer[name]=new Image;
	st_PlayerBuffer[name].height=PLAYER_PIC_HEIGHT;
	st_PlayerBuffer[name].width=PLAYER_PIC_WIDTH;
	st_PlayerBuffer[name].onload=function()
	{
		$.get("file/player/"+name+"/info.json",function(data)
		{
			if (typeof(data)=="object")
				st_PlayerInfo[name]=data;
			else
				st_PlayerInfo[name]=JSON.parse(data);
			st_FaceBuffer[name]=new Image;
			st_FaceBuffer[name].onload=function()
			{
				moduleCompleted++;
				console.log("pl");
			}
			st_FaceBuffer[name].src="file/player/"+name+"/fc.png"
		})
	}
	st_PlayerBuffer[name].src="file/player/"+name+"/pic.png";
}