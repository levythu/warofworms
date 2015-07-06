//***********************
//LATEST EDIT: 7/16 22:27
//About terrain
//BY LEVY
//***********************

var ter_pics=[];	//地形贴图
var ter_mapInfo={};	//地图玩家出生点信息

function getTerrain(id)	//加载贴图
{
	var x1=new Image;
	x1.onload=function()
	{
		var x2=new Image;
		x2.onload=function()
		{
				$.get("file/terrain/"+id+"/info.json",function(data)
				{
					if (typeof(data)=="object")
						ter_mapInfo[id]=data;
					else
						ter_mapInfo[id]=JSON.parse(data);
					moduleCompleted++;
					console.log("ter");
				})
		}
		x2.src="file/terrain/"+id+"/bk.png";
	}
	x1.src="file/terrain/"+id+"/pic.png";
	ter_pics.push(x1);
}
function initTerrain(id)	//根据贴图生成碰撞数组，初始化
{
	var img=new Image;
	globalTerrain.rawData=[];
	globalTerrain.ruin=[];
	for (var i=0;i<HEIGHT;i++)
	{
		globalTerrain.rawData[i]=new Array(WIDTH);
		globalTerrain.ruin[i]=new Array(WIDTH);
	}
	img.onload=function()
	{
		var canvas=$("#canvas1")[0];
		var context=canvas.getContext("2d");
		context.clearRect(0,0,WIDTH,HEIGHT);
		context.drawImage(this, 0, 0);
		
		var imageData=context.getImageData(0,0,WIDTH,HEIGHT);
        var data=imageData.data;
		var x=0,y=0;
		for (var i=0;i<data.length;i+=4) 
		{
			//if (data[i]==TRANSPARENT_COLOR[0] && data[i+1]==TRANSPARENT_COLOR[1] && data[i+2]==TRANSPARENT_COLOR[2])
			if (data[i+3]==0)
			{
				//data[i+3]=0;
				globalTerrain.rawData[x][y]=false;
			}
			else
			{
				globalTerrain.rawData[x][y]=true;
			}
			globalTerrain.ruin[x][y]=false;
			y++;
			if (y==WIDTH)
			{
				x++;
				y=0;
			}
        }
		context.putImageData(imageData,0,0);
		$("#backG").css("background-size",SHOW_WIDTH+"px "+SHOW_HEIGHT+"px")
				   .css("background-image","url(file/terrain/"+id+"/bk.png)");
		postLoad(id);
	}
	img.src="file/terrain/"+id+"/pic.png";
}
function refreshTerrain(x,y,w,h)	//根据爆炸毁坏数组重绘部分炸坏的地形
{
	var context=$("#canvas1")[0].getContext("2d");
	var imageData=context.getImageData(x,y,w,h);
    var data=imageData.data;
	var ct=0;
	for (var i=y;i<y+h;i++)
	{
		if (i>=HEIGHT) break;
		for (var j=x;j<x+w;j++)
		{
			if (globalTerrain.ruin[i][j])
			{
				globalTerrain.rawData[i][j]=false;
				data[4*ct+3]=0;
			}
			ct++;
		}
	}
	context.putImageData(imageData,x,y);
}