let currentSolution = "";

let solutionMapper = [];

const startCoins = 50;
const levelCoins = 5;
const letterTipCost = 10;

$(document).ready(() => {
	// init click handlers
	$("#bin").click(function () {
		$("#solution .letter").each(function () {
			$(this).click();
		});
	});
	$("#lettertip").click(() => {
		let coins = parseInt($("#coins").text());
		if (!coins && coins !== 0) return;

		if (coins < letterTipCost) {
			$("#nocoins").removeClass("hidden");
			$("#game button:not(#nocoins button)").prop("disabled", true);
		} else {
			$("#uselettertip").removeClass("hidden");
			$("#game button:not(#uselettertip button)").prop("disabled", true);
		}
	});
	$("#nocoins .confirm").click(() => {
		$("#nocoins").addClass("hidden");
		$("#game button:not(#nocoins button)").prop("disabled", false);
	});
	$("#uselettertip .confirm").click(() => {
		$("#uselettertip").addClass("hidden");
		$("#game button:not(#uselettertip button)").prop("disabled", false);
		letterTip();
		$("#coins").text(parseInt($("#coins").text()) - letterTipCost);
	});
	$("#uselettertip .abort").click(() => {
		$("#uselettertip").addClass("hidden");
		$("#game button:not(#uselettertip button)").prop("disabled", false);
	});
	$("#startbutton").click(() => {
		$("#start").addClass("hidden");
		$("#game").removeClass("hidden");
	});
	$("#levelup .confirm").click(() => {
		let level = $("#level");
		level.text(parseInt(level.text()) + 1);
		let coins = $("#coins");
		coins.text(parseInt(coins.text()) + levelCoins);
		clearGameBoard();
		setNextLevel();
		$("#levelup").addClass("hidden");
		$("#game button:not(#levelup .confirm)").prop("disabled", false);
	});
});


function clearGame() {
	$("#start").addClass("hidden");
	$("#game").addClass("hidden");
	$("#finish").addClass("hidden");
}

function startGame() {
	$("#level").text(1);
	$("#coins").text(startCoins);

	clearGameBoard();
	let nextLevel = setNextLevel();
	if(!nextLevel) return;

	$("#start").removeClass("hidden");
}

function clearGameBoard() {
	$("#images img").each(function () {
		$(this).removeAttr("src");
	});
	$(".letter").each(function () {
		$(this).remove();
	});
}

function nextLevel() {
	$("#nextlevel").text(parseInt($("#level").text()) + 1);
	$("#levelup").removeClass("hidden");
	$("#game button:not(#levelup .confirm)").prop("disabled", true);
}

function setNextLevel() {
	currentSolution = levelGenerator.next().value;
	let images = levelGenerator.next().value;

	if (!currentSolution) {
		finish();
		return false;
	}

	shuffle(images);
	for (let i in images) {
		$("#image" + i).attr("src", images[i]);
	}

	generateLetters(currentSolution);

	return true;
}

function generateLetters(solution) {
	let charArray = [];
	let generatedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

	for (let i = 0; i < solution.length; i++) {
		$("#solution").prepend("<button class='input-box letter empty'></button>");
		charArray.push(solution[i]);
	}

	for(let i = 0; i < solution.length * 1.5; i++) {
		charArray.push(generatedChars.charAt(Math.floor(Math.random() * generatedChars.length)));
	}

	if(charArray.length % 2 !== 0) {
		charArray.push(generatedChars.charAt(Math.floor(Math.random() * generatedChars.length)));
	}

	shuffle(charArray);

	for (let i = 0; i < charArray.length; i++) {
		$("#letters").prepend("<button class='input-box letter'>" + charArray[i].toUpperCase() + "</button>");
	}

	$("#letters .letter:not(.empty)").click(function () {
		insertLetter($(this));
	});
}

function moveSolutionLetter(letterElement, solutionElement) {
	solutionElement.text(letterElement.text());
	letterElement.text("");
	letterElement.addClass("empty");
	solutionElement.removeClass("empty");

	animateLetter(solutionElement, letterElement, checkAnswer);

	solutionMapper[solutionElement.index()] = letterElement.index();
}

function insertLetter(letterElement) {
	$("#solution .letter").each(function () {
		if (!$(this).text()) {
			moveSolutionLetter(letterElement, $(this));
			$(this).click(() => {
				resetLetter($(this));
				$(this).unbind("click");
			});
			return false;
		}
	});
}

function resetLetter(solutionElement, callback) {
	let letterElementIndex = solutionMapper[solutionElement.index()];
	delete solutionMapper[solutionElement.index()];
	let letterElement = $($("#letters .letter").get(letterElementIndex));
	letterElement.text(solutionElement.text());
	solutionElement.text("");
	solutionElement.addClass("empty");
	solutionElement.unbind("click");
	$("#solution .letter").removeClass("wrong");

	animateLetter(letterElement, solutionElement, () => {
		letterElement.removeClass("empty");
		if(callback) callback();
	});

	return letterElement;
}

function animateLetter(destination, source, callback) {
	let fontSize = destination.css("font-size");
	destination.css("font-size", "0");

	source.clone(false)
		.addClass("input-box")
		.addClass("letter")
		.addClass("letter-animation")
		.css("left", source.position().left)
		.css("top", source.position().top)
		.text(destination.text())
		.appendTo("body")
		.animate({
			left: destination.position().left,
			top: destination.position().top
		}, {
			complete: function () {
				destination.css("font-size", fontSize);
				$(this).remove();
				if(callback) callback();
			}
		});
}

function checkAnswer() {
	let solution = $("#solution .letter");

	let filled = true;
	solution.each((i, e) => {
		if (!$(e).text()) {
			filled = false;
			return false;
		}
	});

	if (!filled) {
		return;
	}

	let correct = true;
	solution.each((i, e) => {
		if ($(e).text().charAt(0).toLowerCase() !== currentSolution.charAt(i).toLowerCase()) {
			correct = false;
			return false;
		}
	});

	if (!correct) {
		solution.addClass("wrong");
		return;
	}

	nextLevel();
}

function letterTip() {
	let letterTip = shuffle($("#solution .letter:not(.locked)")).first();
	letterTip.unbind("click");
	if (letterTip.text().charAt(0).toLowerCase() === currentSolution.charAt(letterTip.index()).toLowerCase()) {
		letterTip.addClass("locked");
		return;
	}

	if(letterTip.text()) {
		resetLetter(letterTip, selectTip);
		letterTip.addClass("locked");
	} else {
		selectTip();
	}

	function selectTip() {
		let found = false;
		$("#letters .letter:not(.empty)").each(function () {
			if($(this).text().charAt(0).toLowerCase() === currentSolution.charAt(letterTip.index()).toLowerCase()) {
				letterTip.addClass("locked");
				moveSolutionLetter($(this), letterTip);
				found = true;
				return false;
			}
		});
		if(found) return;
		$("#solution .letter:not(.empty, .locked)").each(function () {
			if($(this).text().charAt(0).toLowerCase() === currentSolution.charAt(letterTip.index()).toLowerCase()) {
				let letterElement = resetLetter($(this), () => {
					letterTip.addClass("locked");
					moveSolutionLetter(letterElement, letterTip);
				});
				found = true;
				return false;
			}
		});
	}
}

function finish() {
	$("#game").addClass("hidden");
	$("#finish").removeClass("hidden");
}