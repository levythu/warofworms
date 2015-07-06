//***********************
//LATEST EDIT: 7/14 22:27
//游戏引擎核心代码
//BY LEVY
//***********************
var ker_Refresh2Timer;	//主刷新帧计时器
var ker_LoadingTimer;	//加载检查器（已失效）
var ker_PrevPlayer;	//上一个玩家
var ker_lastZoom=-1;	//上一个焦点情况
var ker_pip=[];	//是否受重力影响
var ker_Blood={};	//双队血量
var ker_LastCan=false;	//上一帧是否显示bar
var ker_artiZoom=false;	//是否人工聚焦
var ker_InGame=false;	//是否在游戏模式
var ker_SetEnd=false;	//是否已经判定了游戏结束
var ker_isFly;	//是否有玩家在飞
/*
var playBGM=document.createElement("audio");
	playBGM.loop=true;
	playBGM.preload="meta";
	playBGM.src="au/vik.mp3";*/

function clickOn(e)	//鼠标事件，用于人工聚焦
{
	if (!ker_InGame) return;
	console.log(e.clientX,e.clientY);
	zoom("art",e.clientX,e.clientY);
}
function preLoad()	//进入游戏前的预加载。加载所有资源
{
	$("#canvas1")[0].height=HEIGHT;
	$("#canvas1")[0].width=WIDTH;
	$("#canvas2")[0].height=HEIGHT;
	$("#canvas2")[0].width=WIDTH;
	$("#canvas3")[0].height=HEIGHT;
	$("#canvas3")[0].width=WIDTH;
	$(".smallerSize").css("width",SHOW_WIDTH-MAP_MARGIN)
				 	 .css("height",SHOW_HEIGHT-MAP_MARGIN);
	$(".uniSize").css("width",SHOW_WIDTH)
				 .css("height",SHOW_HEIGHT)
				 .css("left",-MAP_MARGIN)
				 .css("top",-MAP_MARGIN);

	getTerrain(2);
	getTerrain(1);
	getTerrain(3);
	getTerrain(4);
	getTerrain(5);
	initMissile();
	initAimer();
	initArrow();
	initSmoke();
	initSoul();
	initEnchante("p20");
	initEnchante("p50");
	initEnchante("x3");
	initPlayerPic("red",2);
	initPlayerPic("blue",3);
	$("#box").click(clickOn);
	globalContext2=$("#canvas2")[0].getContext("2d");
	globalContext3=$("#canvas3")[0].getContext("2d");
	if (document.all) globalIsIE=true; else globalIsIE=false;
	document.onkeydown=keyboardHook;
	document.onkeyup=keyboardHook2;
}
function zoom(size,dx,dy)	//聚焦函数
{
	var pX,pY;
	if (size=="art")
	{
		$(".uniSize").css("transition","1s")
					 .css("-moz-transition","1s")
					 .css("-webkit-transition","1s")
					 .css("-o-transition","1s");
		$(".uniSize").css("width",WIDTH)
				 	 .css("height",HEIGHT);
				
		pX=-$(".uniSize")[0].offsetLeft+dx;
		pY=-$(".uniSize")[0].offsetTop+dy;
		console.log(pX,pY);
		if (pX<=SHOW_WIDTH/2+MAP_MARGIN)
			$(".uniSize").css("left",-MAP_MARGIN);
		else if (pX>WIDTH-MAP_MARGIN-SHOW_WIDTH/2)
			$(".uniSize").css("left",-WIDTH+SHOW_WIDTH+MAP_MARGIN);
		else 
			$(".uniSize").css("left",SHOW_WIDTH/2-pX);
		if (pY<=SHOW_HEIGHT/2+MAP_MARGIN)
			$(".uniSize").css("top",-MAP_MARGIN);
		else if (pY>HEIGHT-MAP_MARGIN-SHOW_HEIGHT/2)
			$(".uniSize").css("top",-HEIGHT+SHOW_HEIGHT+MAP_MARGIN);
		else 
			$(".uniSize").css("top",SHOW_HEIGHT/2-pY);
			
		ker_artiZoom=true;
		ker_lastZoom=-2;
	}
	if (ker_artiZoom) return;
	
	var thisZoom=(size=="all"?-1:globalFocus)
	if (thisZoom==ker_lastZoom)
	{
		$(".uniSize").css("transition","0s")
					 .css("-moz-transition","0s")
					 .css("-webkit-transition","0s")
					 .css("-o-transition","0s");
	}
	else
	{
		$(".uniSize").css("transition","1s")
					 .css("-moz-transition","1s")
					 .css("-webkit-transition","1s")
					 .css("-o-transition","1s");
	}
	if (size=="all")
	{
		$(".uniSize").css("width",SHOW_WIDTH)
				 	 .css("height",SHOW_HEIGHT)
				 	 .css("left",-MAP_MARGIN)
				 	 .css("top",-MAP_MARGIN);
	}
	else
	{
		$(".uniSize").css("width",WIDTH)
				 	 .css("height",HEIGHT);
		pX=Math.round(globalObjects[globalFocus].position[0]);
		pY=Math.round(globalObjects[globalFocus].position[1]);
		if (pX<=SHOW_WIDTH/2+MAP_MARGIN)
			$(".uniSize").css("left",-MAP_MARGIN);
		else if (pX>WIDTH-MAP_MARGIN-SHOW_WIDTH/2)
			$(".uniSize").css("left",-WIDTH+SHOW_WIDTH+MAP_MARGIN);
		else 
			$(".uniSize").css("left",SHOW_WIDTH/2-pX);
		if (pY<=SHOW_HEIGHT/2+MAP_MARGIN)
			$(".uniSize").css("top",-MAP_MARGIN);
		else if (pY>HEIGHT-MAP_MARGIN-SHOW_HEIGHT/2)
			$(".uniSize").css("top",-HEIGHT+SHOW_HEIGHT+MAP_MARGIN);
		else 
			$(".uniSize").css("top",SHOW_HEIGHT/2-pY);
	}
	ker_lastZoom=thisZoom;
}
function nextPlay(who)	//切换至下一个玩家动手
{
	globalObjects[ker_PrevPlayer].operate="idle";
	if (who==-1)
	{
		var dieCount=0;
		sbFocus=(ker_PrevPlayer+1)%globalPlayerCount;
		while (globalObjects[sbFocus].status=="die")
		{
			dieCount++;
			sbFocus=(sbFocus+1)%globalPlayerCount;
			if (dieCount>globalPlayerCount)
			{
				globalFocus=10000;
				return;
			}
		}
	}
	else
		sbFocus=who;
	if (globalFocus==10000 && globalObjects[sbFocus].status=="fly")
	{
		setTimeout(function(){nextPlay(sbFocus)},1000/FPS);
		return;
	}
	globalFocus=sbFocus;
	globalObjects[globalFocus].operate="do";
	ker_artiZoom=false;
	ker_PrevPlayer=globalFocus;
	st_aimer_angle=INIT_ANGLE;
	globalObjects[globalFocus].energy=MAX_ENERGY;
	globalObjects[globalFocus].enchanter=[];
	
	$("#bktn")[0].pause();
	$("#bktn")[0].currentTime=0;
	$("#bktn")[0].play();
	
	globalWind=(5-Math.sqrt(Math.random()*25))*(Math.random()<0.5?-1:1);
}
function keyboardHook(e)		//键盘按下事件
{
	if (!ker_InGame) return;
	e.preventDefault();
	if (globalFocus>=globalPlayerCount) return;
	
	var keyPressed=e.keyCode;
	ker_artiZoom=false;
	if (globalObjects[globalFocus].status=="fly" && !globalObjects[globalFocus].haveLean)	//如果有人处于跳跃状态则接受一次空推动作
	{
		switch (keyPressed)
		{
		case KEY_LEFT:
			globalObjects[globalFocus].onLean("l");
			break;
		case KEY_RIGHT:
			globalObjects[globalFocus].onLean("r");
			break;
		}
	}
	if (globalObjects[globalFocus].operate=="ready" && keyPressed==KEY_SPACE)	//蓄力
	{
		globalObjects[globalFocus].onReady();
	}
	if ((globalObjects[globalFocus].status=="stand" || globalObjects[globalFocus].status=="crawl") && globalObjects[globalFocus].operate=="do")	//如果处于站立、爬行状态则接受移动，用道具，跳跃等动作
	{
		switch (keyPressed)
		{
		case KEY_LEFT:
			if (globalObjects[globalFocus].status=="stand") st_walkRound=FPS/4-1;
			globalObjects[globalFocus].onCrawl("l");
			break;
		case KEY_RIGHT:
			if (globalObjects[globalFocus].status=="stand") st_walkRound=FPS/4-1;
			globalObjects[globalFocus].onCrawl("r");
			break;
		case KEY_LCTRL:
			globalObjects[globalFocus].onJump();
			break;
		case KEY_UP:
			if (st_aimer_angle<45)
				st_aimer_angle++;
			break;
		case KEY_DOWN:
			if (st_aimer_angle>-45)
				st_aimer_angle--;
			break;
		case KEY_SPACE:
			globalObjects[globalFocus].lForce=0;
			globalObjects[globalFocus].onReady();
			break;
		case KEY_P:
			nextPlay(-1);
			break;
		case KEY_Z:
			globalObjects[globalFocus].onEnchantez("x3");
			break;
		case KEY_X:
			globalObjects[globalFocus].onEnchantez("p50");
			break;
		case KEY_C:
			globalObjects[globalFocus].onEnchantez("p20");
			break;
		}
	}
}
function keyboardHook2(e)	//放起按键
{
	if (!ker_InGame) return;
	e.preventDefault();
	if (globalFocus>=globalPlayerCount) return;
	var keyPressed=e.keyCode;
	if (keyPressed==KEY_LEFT || keyPressed==KEY_RIGHT)	//结束走路
	{
		if (globalObjects[globalFocus].status=="crawl") globalObjects[globalFocus].status="none";
	}
	if (globalObjects[globalFocus].operate=="ready" && keyPressed==KEY_SPACE)	//结束蓄力
	{
		globalObjects[globalFocus].onLaunch(st_aimer_angle,globalObjects[globalFocus].lForce);
	}
}
function startGame(id)	//开始加载一局游戏的地形
{
	initTerrain(id);
}
function postLoad(id)	//地形加载完成后正式配置游戏
{
	$('#starting-image').css("top","-630px");
	ker_Refresh2Timer=setInterval(refreshLayerDeux,1000/FPS);

	var huahua;
	MAX_TEAM_HEALTH=100*ter_mapInfo[id].spawn_X.length/2;
	for (var i=0;i<ter_mapInfo[id].spawn_X.length;i++)
	{
		huahua=new player(i,(i%2==0?"red":"blue"));
		huahua.onSpawn(ter_mapInfo[id].spawn_X[i],ter_mapInfo[id].spawn_Y[i]);
		globalObjects.push(huahua);
	}
	globalPlayerCount=ter_mapInfo[id].spawn_X.length;
	
	globalFocus=0;
	ker_PrevPlayer=0;
	globalObjects[0].operate="do";
	globalObjects[0].energy=MAX_ENERGY;
	globalObjects[globalFocus].enchanter=[];
	
	$("#bk1")[0].pause();
	$("#bk1")[0].currentTime=0;
	$("#bk1")[0].play();
	$("#bkm")[0].pause();
	//playBGM.play();
	
	st_aimer_angle=INIT_ANGLE;
	globalWind=Math.random()*10-5;
	ker_InGame=true;
}
function standConfirm()	//确认玩家站、飞状态
{
	if ((globalFocus<globalPlayerCount && globalObjects[globalFocus].status=="die")||globalFocus>=globalObjects.length)
		nextPlay(-1);
	ker_isFly=false;
	for (var i=0;i<globalPlayerCount;i++)
	{
		if (globalObjects[i].status=="crawl" || globalObjects[i].status=="die") continue;
		
		if (globalObjects[i].velocity[0]==0 && globalObjects[i].velocity[1]==0 && !ker_pip[i])
			globalObjects[i].status="stand";
		else
		{
			globalObjects[i].status="fly";
			if (globalObjects[i].elaticity>0) ker_isFly=true;
		}
	}
}
function checkLoad()	//检查加载结果（已废）
{
	if (globalFlag==FLAG_FULL)
	{
		clearInterval(ker_LoadingTimer);
		postLoad();
	}
}
function gravity()	//施加重力影响
{
	var posX,posY
	for (var i=0;i<globalObjects.length;i++)
	{	
		//ATTENTION: ARRAY OVERFLOW
		posX=Math.round(globalObjects[i].position[0]);
		posY=Math.round(globalObjects[i].position[1]);
		if (globalObjects[i].type=="anime" || posY<MAP_MARGIN || !globalTerrain.rawData[posY+1][posX])
		{
			ker_pip[i]=true;
			globalObjects[i].velocity[1]+=globalObjects[i].g/FPS;
			if (globalObjects[i].velocity[1]>MAX_FALLING_SPEED)
				globalObjects[i].velocity[1]=MAX_FALLING_SPEED;
		}
		else ker_pip[i]=false;
	}
}
function wind()	//施加风速影响
{
	for (var i=0;i<globalObjects.length;i++)
		if (globalObjects[i].windVul)
			globalObjects[i].velocity[0]+=globalWind*10/FPS
	
}
function motion()	//物体移动以及碰撞判定
{
	var division,vx,vy,px,py;
	var hasCrushed=[];
	for (var i=0;i<globalObjects.length;i++)
	{	
		//ATTENTION: ARRAY OVERFLOW
		vx=globalObjects[i].velocity[0]/FPS;
		vy=globalObjects[i].velocity[1]/FPS;
		//if(i==0)console.log(globalObjects[i].velocity[1]);
		division=Math.max(Math.ceil(Math.abs(vx)),Math.ceil(Math.abs(vy)));
		hasCrushed[i]=false;
		if (globalObjects[i].position[1]<=MAP_MARGIN)	//特殊处理物体向上飞出地图的情况
		{
			globalObjects[i].position[0]+=vx;
			globalObjects[i].position[1]+=vy;
			if (globalObjects[i].position[0]<=MAP_MARGIN || globalObjects[i].position[0]>WIDTH-MAP_MARGIN || globalObjects[i].position[1]>HEIGHT-MAP_MARGIN)
			{
				if (globalObjects[i].type=="player")
				{
					globalObjects[i].velocity=[0,0];
					globalObjects[i].g=0;
					globalObjects[i].onDie();
				}
				if (globalObjects[i].type=="entity" || globalObjects[i].type=="anime")
				{
					globalObjects[i].velocity=[0,0];
					globalObjects[i].g=0;
					globalObjects[i].windVul=0;
					globalObjects[i].canEliminate=true;
				}
			}
			continue;	
		}
		if (globalObjects[i].type=="player")
		{
			px=vx/division;
			py=vy/division;
			for (var j=0;j<division;j++)
			{
				globalObjects[i].position[0]+=px;
				globalObjects[i].position[1]+=py;
				if (globalObjects[i].position[0]<=MAP_MARGIN || globalObjects[i].position[0]>WIDTH-MAP_MARGIN || globalObjects[i].position[1]>HEIGHT-MAP_MARGIN)
				{
					globalObjects[i].velocity=[0,0];
					globalObjects[i].g=0;
					globalObjects[i].onDie();
				}
				if (globalTerrain.rawData[Math.round(globalObjects[i].position[1])][Math.round(globalObjects[i].position[0])])
				{
					hasCrushed[i]=true;
					globalObjects[i].position[0]-=px;
					globalObjects[i].position[1]-=py;
					break;
				}
			}
		}
		else if (globalObjects[i].type=="entity")
		{
			var oX=globalObjects[i].position[0];
			var oY=globalObjects[i].position[1];
			px=vx/division;
			py=vy/division;
			for (var j=0;j<division;j++)
			{
				globalObjects[i].position[0]+=px;
				globalObjects[i].position[1]+=py;
				if (globalObjects[i].position[0]<=MAP_MARGIN || globalObjects[i].position[0]>WIDTH-MAP_MARGIN || globalObjects[i].position[1]>HEIGHT-MAP_MARGIN)
				{
					globalObjects[i].velocity=[0,0];
					globalObjects[i].g=0;
					globalObjects[i].windVul=0;
					globalObjects[i].canEliminate=true;
				}
				for (var p=0;p<3;p++)
				{
					for (var q=0;q<3;q++)
						if (globalTerrain.rawData[Math.round(oY+q)][Math.round(oX+p)])
						{
							hasCrushed[i]=true;
							globalObjects[i].position[0]-=px;
							globalObjects[i].position[1]-=py;
							break;
						}
					if (hasCrushed[i]) break;
				}
				if (hasCrushed[i]) break;		
			}
		}
		else
		{
			globalObjects[i].position[0]+=vx;
			globalObjects[i].position[1]+=vy;
			if (globalObjects[i].position[0]<=MAP_MARGIN || globalObjects[i].position[0]>WIDTH-MAP_MARGIN || globalObjects[i].position[1]>HEIGHT-MAP_MARGIN)
			{
				globalObjects[i].velocity=[0,0];
				globalObjects[i].g=0;
				globalObjects[i].windVul=0;
				globalObjects[i].canEliminate=true;
			}
		}
	}
	for (var i=0;i<globalObjects.length;i++)
		if (hasCrushed[i])
			globalObjects[i].onCrush();
}
function checkEliminate()	//移除可移除的数据
{
	for (var i=0;i<globalObjects.length;i++)
		if (globalObjects[i].canEliminate)
		{
			if (globalFocus==i)
			{
				globalFocus=10000;
				//setTimeout(nextPlay,2000);
				nextPlay(-1);
			}
			globalObjects.splice(i,1);
			i--;
		}
}
function refreshLayerDeux()	//刷新主进程，按FPS频率触发
{
	globalContext2.clearRect(0,0,WIDTH,HEIGHT);
	gravity();
	wind();
	motion();
	standConfirm();
	checkEliminate();
	refreshLayerTrois();
	if (globalFocus<globalPlayerCount && !ker_isFly)
	{
		zoom("part");
	}
	else
		zoom("all");
	calculateBlood();
	for (var i=0;i<globalObjects.length;i++)
		globalObjects[i].onDraw(globalContext2);
	if (ker_SetEnd==false && (ker_Blood.red<=0 || ker_Blood.blue<=0))
	{
		ker_InGame=false;
		setTimeout(gameOver,1500);
		ker_SetEnd=true;
		$("#bk1")[0].pause();
	}
}
function refreshLayerTrois()	//刷新辅助进程，用于刷新图层三的信息
{
	globalContext3.clearRect(0,0,WIDTH,HEIGHT);
	if (globalFocus<globalPlayerCount && (globalObjects[globalFocus].operate=="do" || globalObjects[globalFocus].operate=="ready") && (globalObjects[globalFocus].status=="stand" || globalObjects[globalFocus].status=="crawl") && globalObjects[globalFocus].position[1]>MAP_MARGIN)
	{
		drawAimer(globalObjects[globalFocus].position[0],globalObjects[globalFocus].position[1],globalObjects[globalFocus].faceAngle,globalObjects[globalFocus].orientation);
		if (!ker_LastCan)
		{
			$("#barer").css("opacity",0.9);
			$("#forceI").css("width",0);
		}
		ker_LastCan=true;
	}
	else
	{
		if (ker_LastCan) $("#barer").css("opacity",0);
		ker_LastCan=false;
	}
	if (globalWind<0)
		$("#winder").text("< "+(-globalWind.toFixed(1))+"  ");
	else
		$("#winder").text("  "+(globalWind.toFixed(1))+" >");
	if (globalFocus<globalPlayerCount && globalObjects[globalFocus].operate=="do" && globalObjects[globalFocus].position[1]>MAP_MARGIN)	
	{
		globalContext3.save();
		globalContext3.fillStyle="rgba(50,255,50,0.9)";
		globalContext3.fillRect(globalObjects[globalFocus].position[0]-ENERGY_WIDTH/2, globalObjects[globalFocus].position[1]-45, ENERGY_WIDTH/MAX_ENERGY*globalObjects[globalFocus].energy, 4);
		globalContext3.restore();
	}
}
function calculateBlood()	//计算队伍血量
{
	ker_Blood.red=0;
	ker_Blood.blue=0;
	for (var i=0;i<globalPlayerCount;i++)
		ker_Blood[globalObjects[i].appear]+=globalObjects[i].health;
	$("#leftBlood").css("width",ker_Blood.red/MAX_TEAM_HEALTH*MAX_HEALTH_WIDTH);
	$("#rightBlood").css("width",ker_Blood.blue/MAX_TEAM_HEALTH*MAX_HEALTH_WIDTH);
}
function gameOver()	//游戏结束设置
{
	globalObjects=[];
	clearInterval(ker_Refresh2Timer);
	
	$("#bkvk")[0].pause();
	$("#bkvk")[0].currentTime=0;
	$("#bkvk")[0].play();
	
	ker_SetEnd=false;
	if (ker_Blood.red==0)
		goToEndingPage("BLUE TEAM");
	else
		goToEndingPage("RED TEAM");
	
}
