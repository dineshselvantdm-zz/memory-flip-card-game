var TIMER_DURATION = 60;

var MemoryGame = (function(){

	var gridSize = 4;
	var totalAlphabets = 26;
	var alphabetArray = [];
	var playerName;
	var count = 0;
	var prevAlphabet = null;
	var prevElem = null;
	var blocksCount = gridSize*gridSize;
	var chosenAlphabetsCount = Math.floor(blocksCount/2); 
	
	var generateRandomNum = function(totalAlphabets){
		return Math.floor(totalAlphabets*Math.random());
	}
	
	var generateAlphabetArray = function(chosenAlphabetsCount,alphabetArray,totalAlphabets){
		for(var i=1;i<=chosenAlphabetsCount;i+=1){
			var randomAlphabet = String.fromCharCode(65 + generateRandomNum(totalAlphabets));
			while(alphabetArray.indexOf(randomAlphabet) >= 0){
				randomAlphabet = String.fromCharCode(65 + generateRandomNum(totalAlphabets));
			}
			alphabetArray.push(randomAlphabet,randomAlphabet);
		}
	}
	
	var shuffleArray = function(array) {
		var i = 0, j = 0, temp = null;
		for (i = array.length - 1; i > 0; i -= 1) {
			j = Math.floor(Math.random() * (i + 1));
			temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
	}
	
	var initListeners = function(){
		var blocks = document.querySelectorAll(".memoryGame__grid__list__box");
			for(var i=0;i<blocks.length;i++){
				blocks[i].addEventListener("click", function(e){
				callBackLogic(e);
			});
		}
	}

	var setUserStats = function(gameResult){
		var userStats = {playerName: playerName||"Anonymous User",timeTaken: (TIMER_DURATION -Timer.timerDuration),gameResult: gameResult||"---"};
		if(gameResult == 'Lost'){
			userStats.timeTaken = 'TIME UP'
		}
		userStatsStorage.pushDataToLocalStorage(userStats);
		alert('You '+gameResult+' the Game');
		setTimeout(function(){
			MemoryGame.initGame();
		},500);			
	}

	var onSuccess = function(){
		Timer.stopTimer();
		setTimeout(function(){
			setUserStats("Won");
		},550);
	}

	var onFailure = function(){
		setUserStats("Lost");
	}
	
	var callBackLogic = function(e){
		if(prevAlphabet == null){
			Timer.initTimer();
		}
		e.target.parentNode.classList.add('flipped');
		count+=1;
		if(count==1){	
			prevAlphabet = e.target.parentNode.getElementsByClassName('memoryGame__grid__list__box__hiddenMsg')[0].innerHTML;
			prevElem = e.target;

		}else if(count==2){
			count = 0;
			var currAlphabet = e.target.parentNode.getElementsByClassName('memoryGame__grid__list__box__hiddenMsg')[0].innerHTML;
			if(prevAlphabet != currAlphabet){
				setTimeout(function(){
					prevElem.parentNode.classList.remove('flipped');
					e.target.parentNode.classList.remove('flipped');
				},500);
			}else{
				if(document.querySelectorAll(".flipped").length == blocksCount && Timer.timerDuration > 0){
					onSuccess();					
				}

			}
		}
	}
	
	var generateBlocks = function(alphabetArray){
		var frag = document.createDocumentFragment();		
		for(var i=0;i<alphabetArray.length;i+=1){
			var div = document.createElement("div");
			div.setAttribute('class', 'memoryGame__grid__list__box');
			var span1 = DomApiHelper.createSpanElement('memoryGame__grid__list__box__msg','Click to Flip');
			div.appendChild(span1);
			var span2 = DomApiHelper.createSpanElement('memoryGame__grid__list__box__hiddenMsg',alphabetArray[i]);
			div.appendChild(span2);
			frag.appendChild(div);
		}
		document.getElementsByClassName('memoryGame__grid__list')[0].appendChild(frag);
	}

	var generateUserStatsTable = function(){
		var allUserStats = userStatsStorage.getUserStatsFromLocalStorage();
		if(allUserStats){
			var table = DomApiHelper.createuserStatsTable(allUserStats);
			document.getElementsByClassName('memoryGame__userStats')[0].appendChild(table);
		}
	}

	var initGame = function(){
		playerName = prompt("Please enter your name");
		alphabetArray = [];
		count=0;
		prevAlphabet = null;
		prevElem = null;		
		Timer.stopTimer();
		document.getElementsByClassName('memoryGame__topContainer__timer')[0].innerHTML = TIMER_DURATION+ ' seconds remaining ...';
		document.getElementsByClassName('memoryGame__grid__list')[0].innerHTML = '';
		document.getElementsByClassName('memoryGame__userStats')[0].innerHTML = '';
		generateAlphabetArray(chosenAlphabetsCount,alphabetArray,totalAlphabets);
		shuffleArray(alphabetArray);
		generateBlocks(alphabetArray);
		generateUserStatsTable();
		initListeners();
	}

	return{
		initGame : initGame,
		onFailure: onFailure
	}

})();


var Timer = (function(){

	var timerDuration = TIMER_DURATION;
	var timer;
	var stopTimer = function(){
		clearInterval(timer);
		return timerDuration;
	}
	var initTimer = function(){
		timerDuration = TIMER_DURATION;		
		timer = setInterval(function(){
			Timer.timerDuration--;
			document.getElementsByClassName('memoryGame__topContainer__timer')[0].innerHTML = Timer.timerDuration + ' seconds remaining ...';
			if(Timer.timerDuration < 0){
				clearInterval(timer);
				document.getElementsByClassName('memoryGame__topContainer__timer')[0].innerHTML = 'TIME UP!';
				MemoryGame.onFailure();
			}
		},1000);
	}

	return{
		initTimer : initTimer,	
		stopTimer : stopTimer,
		timerDuration: timerDuration
	}

})();


var userStatsStorage = (function(){

	var pushDataToLocalStorage = function(data){
	    var temp = []; 
	    var userStatsData = getUserStatsFromLocalStorage();
	    if(userStatsData){
	    	temp = userStatsData;
	    }
	    temp.push(data);  
	    localStorage.setItem('userStats', JSON.stringify(temp));
	}
	
	var getUserStatsFromLocalStorage = function(){
		var userStatsData = localStorage.getItem('userStats');   
	    if(userStatsData){
	    	return parsedUserStatsData = JSON.parse(userStatsData);
	    }
	}

	return{
		pushDataToLocalStorage : pushDataToLocalStorage,
		getUserStatsFromLocalStorage:getUserStatsFromLocalStorage
	}

})()

var DomApiHelper = (function(){

	var createSpanElement = function(className,innerHTML){
		var span = document.createElement("span");
		span.setAttribute('class', className);
		span.innerHTML = innerHTML;
		return span;
	}

	var createuserStatsTable = function(allUserStats){
		var table = document.createElement("table");
		var tbody = document.createElement("tbody");
		var thr = document.createElement("tr");
		var th_arr = ['Player Name', 'Time Taken(sec)', 'Result'];
		for(var i=0;i<th_arr.length;i++){
			var th = document.createElement("th");

			var textNode = document.createTextNode(th_arr[i]);
			th.appendChild(textNode);
			thr.appendChild(th);
		}
		tbody.appendChild(thr);
		allUserStats.map(function(userStats){
			var tr = document.createElement("tr");
			appendTableDetails(userStats,tr);
			tbody.appendChild(tr);
		})
		table.appendChild(tbody);	
		return table;
	}

	var appendTableDetails = function(userStats,tr){
		var userStatsPredefinedArr = ['playerName','timeTaken','gameResult'];
		for(var i=0;i<userStatsPredefinedArr.length;i++){
			var td = document.createElement("td");
			var textNode = document.createTextNode(userStats[userStatsPredefinedArr[i]]);
			td.appendChild(textNode);
			tr.appendChild(td);
		}
	}

	return{
		createSpanElement : createSpanElement,
		createuserStatsTable : createuserStatsTable
	}

})()


MemoryGame.initGame();
