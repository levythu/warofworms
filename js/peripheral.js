//***********************
//LATEST EDIT: 7/14 22:27
//外围资源加载
//BY LEVY
//***********************
var st_aimer;
var st_aimer_info={width:60,height:60};
var st_aimer_angle;	//deg
var st_arrow;

function initAimer()	//加载瞄准器
{
	st_aimer=new Image;
	st_aimer.width=st_aimer_info.width;
	st_aimer.height=st_aimer_info.height;
	st_aimer.onload=function()
	{
		moduleCompleted++;
		console.log("aim");
	}
	st_aimer.src="file/entity/aim/pic.png";
}
function drawAimer(x,y,angle,dir)	//rad，绘制瞄准器
{
	globalContext3.save();
	
	globalContext3.translate(x,y);
	globalContext3.rotate(angle);
	if (dir=='l') globalContext3.scale(-1,1);
	globalContext3.rotate(-Math.PI/4);
    globalContext3.drawImage(st_aimer,0,0);
	globalContext3.strokeStyle = "rgba(255,0,0,0.5)";
	globalContext3.beginPath()
	var c1=Math.cos(-st_aimer_angle/180*Math.PI+Math.PI/4);
	var c2=Math.sin(-st_aimer_angle/180*Math.PI+Math.PI/4);
	globalContext3.moveTo(30*c1,30*c2);
	globalContext3.lineTo(60*c1,60*c2);
	globalContext3.stroke();
	
	globalContext3.restore();
}
function initArrow()	//加载指示玩家的箭头
{
	st_arrow=new Image;
	st_arrow.onload=function()
	{
		moduleCompleted++;
		console.log("arrow");
	}
	st_arrow.src="file/entity/arrow/pic.png";
}