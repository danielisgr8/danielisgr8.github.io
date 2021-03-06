$(document).ready(function() {
	$(".upgradesHolder").hide();
	var boxes = [];
	var upgrades = [];
	var autoclickers = [];
	var redList = [];
	var money = 0;
	$(".money").html("Money: $" + money);
	var attack = 10;
	$(".attack").html("Attack: " + attack);
	function redOrBlue() {
		var color = Math.random();
		if(color < 0.5) {
			return "red";
		} else {
			return "blue";
		}
	}
	function autoclicker(id, clickRate) {
		var me = this;
		this.id = id;
		this.clickRate = clickRate;
		this.autoclickerInterval;
		this.clickBox = redList[Math.floor(Math.random() * redList.length)];
		this.autoclick = function() {
			this.autoclickerInterval = window.setInterval(function() {
				if(me.clickBox.onCooldown) {
					redList = [];
					for(var i = 0; i < 192; i++) {
						if(boxes[i].color == "red" && !boxes[i].onCooldown) {
							redList.push(boxes[i]);
						}
					}
					me.clickBox = redList[Math.floor(Math.random() * redList.length)];
				}
				if(!me.clickBox.onCooldown) {
					$("#" + me.clickBox.id).click();
				}
			}, me.clickRate);
		}
		this.autoclick();
	}
	function upgrade(id, title, description, cost) {
		var me = this;
		this.id = id;
		this.title = title;
		this.description = description;
		this.cost = cost;
		this.clickRate = 1000;
		this.autoclickerInterval;
		this.effect = function(effect) {
			if(effect == "lowerCooldown") {
				for(var i = 0; i < 192; i++) {
					boxes[i].cooldownRate++;
				}
				$("#" + this.id + ".description").html("Current: " + boxes[0].cooldownRate);
			} else if(effect == "increaseAttack") {
				for(var i = 0; i < 192; i++) {
					boxes[i].loseHealthRate++;
				}
				$("#" + this.id + ".description").html("Current: " + boxes[0].loseHealthRate);
				$(".attack").html("Attack: " + boxes[0].loseHealthRate);
			} else if(effect == "newMap") {
				for(var i = 0; i < 192; i++) {
					window.clearInterval(boxes[i].gainInterval);
					window.clearInterval(boxes[i].cooldownInterval);
					boxes[i].onCooldown = false;
					$("#" + (i + 1)).css("border-left-width", 0);
					$("#" + (i + 1)).css("border-right-width", 0);
					$("#" + (i + 1)).css("width", 100);
					boxes[i].resetBox();
				}
				for(var i = 0; i < autoclickers.length; i++) {
					window.clearInterval(autoclickers[i].autoclickerInterval);
				}
				localStorage.removeItem("map");
				var map = ""
				for(var i = 0; i < 192; i++) {
					if(boxes[i].color == "red") {
						map += "R";
					} else if(boxes[i].color == "blue") {
						map += "B";
					}
				}
				localStorage.setItem("map", map);
				redList = [];
				for(var i = 0; i < 192; i++) {
					if(boxes[i].color == "red") {
						redList.push(boxes[i]);
					}
				}
				for(var i = 0; i < autoclickers.length; i++) {
					autoclickers[i].clickBox = redList[Math.floor(Math.random() * redList.length)];
				}
			} else if(effect == "autoclicker") {
				redList = [];
				for(var i = 0; i < 192; i++) {
					if(boxes[i].color == "red") {
						redList.push(boxes[i]);
					}
				}
				autoclickers[autoclickers.length] = new autoclicker(autoclickers.length + 1, 1000);
			}
		}
		this.createUpgrade = function() {
			$(".upgradesHolder").append("<div class=\"upgrade\" id=\"" + this.id + "\"></div>");
			$("#" + this.id + ".upgrade").append("<div class=\"infoHolder\" id=\"" + this.id + "\"></div>");
			$("#" + this.id + ".infoHolder").append("<p class=\"title\" id=\"" + this.id + "\">" + this.title + "</p>");
			$("#" + this.id + ".infoHolder").append("<p class=\"description\" id=\"" + this.id + "\">" + this.description + "</p>");
			$("#" + this.id + ".upgrade").append("<p class=\"cost\" id=\"" + this.id + "\">" + this.cost + "</p>");
		}
		this.createUpgrade();
	}
	function box(id, loseHealthRate, gainHealthRate, cooldownRate) {
		var me = this;
		this.id = id;
		this.health;
		this.gainInterval;
		this.cooldownInterval;
		this.loseHealthRate = loseHealthRate;
		this.gainHealthRate = gainHealthRate;
		this.cooldownRate = cooldownRate;
		this.onCooldown = false;
		this.now;
		this.before;
		this.color;
		this.createBox = function() {
			$(".boxHolder").append("<div class=\"box\" id=\"" + (this.id) + "\"></div>");
			this.color = redOrBlue();
			$("#" + (this.id)).css("background-color", this.color);
			if(this.color == "red") {
				$("#" + (this.id)).addClass("red");
			} else if(this.color == "blue") {
				$("#" + (this.id)).addClass("blue");
			}
		}
		this.createBox();
		this.resetBox = function() {
			this.color = redOrBlue();
			$("#" + (this.id)).css("background-color", this.color);
			if(this.color == "red") {
				if($("#" + this.id).hasClass("blue")) {
					$("#" + this.id).removeClass("blue");
					$("#" + this.id).addClass("red");
				}
			} else if(this.color == "blue") {
				if($("#" + this.id).hasClass("red")) {
					$("#" + this.id).removeClass("red");
					$("#" + this.id).addClass("blue");
				}
			}
		}
		this.health = parseInt($("#" + (this.id)).css("width"), 10);
		this.loseHealth = function(color) {
			var box = "#" + this.id;
			if(parseInt($(box).css("width"), 10) > this.loseHealthRate) {
				var width = parseInt($(box).css("width"), 10) - this.loseHealthRate;
				var borderWidth = parseInt($(box).css("border-right-width"), 10) + this.loseHealthRate;
				$(box).css("border-right", borderWidth + "px" + " solid " + color);
				$(box).css("width", width + "px");
			} else {
				$(box).css("border-right", 100 + "px" + " solid " + color);
				$(box).css("width", 0 + "px");
				me.onCooldown = true;
				me.cooldown();
			}
		}
		this.gainHealth = function() {
			var box = "#" + this.id;
			this.before = new Date();
			this.gainInterval = window.setInterval(function() {
				me.now = new Date();
				var a = me.gainHealthRate;
				var elapsedTime = (me.now.getTime() - me.before.getTime());
				if(elapsedTime > 100) {
					//Recover the motion lost while inactive.
					if(a * Math.floor(elapsedTime / 100) + parseInt($(box).css("width"), 10) >= 100) {
						$(box).css("border-right-width", 0 + "px");
						$(box).css("width", 100 + "px");
						window.clearInterval(me.gainInterval);
					} else {
						a = a * Math.floor(elapsedTime / 100);
						$(box).css("border-right-width", parseInt($(box).css("border-right-width"), 10) - a + "px");
						$(box).css("width", parseInt($(box).css("width"), 10) + a + "px");
					}
				} else {
					if(a + parseInt($(box).css("width"), 10) >= 100) {
						$(box).css("border-right-width", 0 + "px");
						$(box).css("width", 100 + "px");
						window.clearInterval(me.gainInterval);
					} else {
						$(box).css("border-right-width", parseInt($(box).css("border-right-width"), 10) - a + "px");
						$(box).css("width", parseInt($(box).css("width"), 10) + a + "px");
					}
				}
				me.before = new Date();
			}, 100);
		}
		this.cooldown = function() {
			var box = "#" + this.id;
			this.before = new Date();
			$(box).css("border-left", 0 + "px solid " + "#800000");
			this.cooldownInterval = window.setInterval(function() {
				me.now = new Date();
				var a = me.cooldownRate;
				var elapsedTime = (me.now.getTime() - me.before.getTime());
				if(elapsedTime > 100) {
					if(a * Math.floor(elapsedTime / 100) + parseInt($(box).css("border-left-width"), 10) >= 100) {
						$(box).css("border-left-width", 0 + "px");
						$(box).css("border-right-width", 0 + "px");
						$(box).css("width", 100 + "px");
						me.onCooldown = false;
						window.clearInterval(me.cooldownInterval);
					} else {
						a = a * Math.floor(elapsedTime / 100);
						$(box).css("border-right-width", parseInt($(box).css("border-right-width"), 10) - a + "px");
						$(box).css("border-left-width", parseInt($(box).css("border-left-width"), 10) + a + "px");
					}
				} else {
					if(a + parseInt($(box).css("border-left-width"), 10) >= 100) {
						$(box).css("border-left-width", 0 + "px");
						$(box).css("border-right-width", 0 + "px");
						$(box).css("width", 100 + "px");
						me.onCooldown = false;
						window.clearInterval(me.cooldownInterval);
					} else {
						$(box).css("border-right-width", parseInt($(box).css("border-right-width"), 10) - me.cooldownRate + "px");
						$(box).css("border-left-width", parseInt($(box).css("border-left-width"), 10) + me.cooldownRate + "px");
					}
				}
				me.before = new Date();
			}, 100);
		}
	}
	for(var i = 0; i < 192; i++) {
		boxes[i] = new box(i + 1, attack, 1, 10);
	}
	$(".box").click(function() {
		var boxId = parseInt($(this).attr("id"), 10);	
		if($(this).attr("class").includes("red") && !boxes[boxId - 1].onCooldown) {
			boxes[boxId - 1].loseHealth("black");
			window.clearInterval(boxes[boxId - 1].gainInterval);
			if(parseInt($("#" + boxes[boxId - 1].id).css("width"), 10) != 0) {
				boxes[boxId - 1].gainHealth();
			}
		} else if ($(this).attr("class").includes("blue")) {
			money++;
			$(".money").html("Money: $" + money);
		}
	});
	$(".dropDown").click(function() {
		$(".upgradesHolder").slideToggle();
	});
	upgrades[0] = new upgrade(1, "Lower Cooldown", "Current: " + boxes[0].cooldownRate, "$0");
	upgrades[1] = new upgrade(2, "Increase Attack", "Current: " + boxes[0].loseHealthRate, "$0");
	upgrades[2] = new upgrade(3, "New Map", "Create a new map", "$0");
	upgrades[3] = new upgrade(4, "Autoclicker", "Clicks a red cell every " + upgrades[0].clickRate / 1000 + " second(s)", "$0");
	for(var i = 4; i < 10; i++) {
		upgrades[i] = new upgrade(i + 1, "Title", "Desription", "Cost");
	}
	$(".upgrade").click(function() {
		if($(this).attr("id") == "1") {
			upgrades[0].effect("lowerCooldown");
		} else if($(this).attr("id") == "2") {
			upgrades[1].effect("increaseAttack");
		} else if($(this).attr("id") == "3") {
			upgrades[2].effect("newMap");
		} else if($(this).attr("id") == "4") {
			upgrades[3].effect("autoclicker");
		}
	});
	if(localStorage.getItem("map") == null) {
		var map = "";
		for(var i = 0; i < boxes.length; i++) {
			if(boxes[i].color == "red") {
				map += "R";
			} else if(boxes[i].color == "blue") {
				map += "B";
			}
		}
	} else {
		var map = localStorage.getItem("map");
	}
	// change map to localstorage map
	for(var i = 0; i < map.length; i++) {
		if(map[i] == "R") {
			boxes[i].color = "red";
			if($("#" + (i + 1)).hasClass("blue")) {
				$("#" + (i + 1)).removeClass("blue");
				$("#" + (i + 1)).addClass("red");
			}
		} else if(map[i] == "B") {
			boxes[i].color = "blue";
			if($("#" + (i + 1)).hasClass("red")) {
				$("#" + (i + 1)).removeClass("red");
				$("#" + (i + 1)).addClass("blue");
			}	
		}
		$("#" + (i + 1)).css("background-color", boxes[i].color);
	}
	localStorage.setItem("map", map);
	/*$(".add").click(function() {
		map++;
		localStorage.setItem("map", map);
		console.log(localStorage.getItem("map"));
	});
	$(".subtract").click(function() {
		map--;
		localStorage.setItem("map", map);
		console.log(localStorage.getItem("map"));
	});*/
});
/*
TODO
MAKE SEPERATE OBJECT FOR ATUOCLICKER, every new purchase of autoclicker makes new autoclicker object, but autoclickers in an array to easily stop all autoclickers
AUTOCLICKER: what happens when new map is generated while autoclicker is on?
use localstorage for money/attack also
red blocks break after 2nd use, blue blocks break after one click
then, other blocks fall in that column and a new block appears at the top
*/