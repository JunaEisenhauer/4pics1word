switch (getSelectedWords()) {
	case "words":
		$("#words").addClass("active");
		break;
	case "nouns":
		$("#nouns").addClass("active");
		break;
	case "verbs":
		$("#verbs").addClass("active");
		break;
	case "adjectives":
		$("#adjectives").addClass("active");
		break;
}

$("nav a").click(function () {
	if($(this).attr("id") === getSelectedWords) return;
	$("nav a.active").removeClass("active");
	$(this).addClass("active");
	clearGame();
	levelList = [];
	load();
});

load();

function getSelectedWords() {
	let selectedWords = window.location.search.substr(1);

	selectedWords = selectedWords.toLowerCase();
	if (!selectedWords) {
		window.location.search = "words";
		selectedWords = "words";
	}
	return selectedWords;
}

function load() {
	$(document).ready(() => {
		let selectedWords = getSelectedWords();
		let allWords = !selectedWords || selectedWords === "words";

		if(allWords) {
			loadData("nouns.json").then(() => loadData("verbs.json").then(() => loadData("adjectives.json").then(startGame).catch(() => {
				if(levelList) startGame();
			})));
		}

		if (selectedWords === "nouns") {
			loadData("nouns.json").then(startGame);
		}
		if (selectedWords === "verbs") {
			loadData("verbs.json").then(startGame);
		}
		if (selectedWords === "adjectives") {
			loadData("adjectives.json").then(startGame);
		}
	});
}

function shuffle(array) {
	let i, random, tmp;
	for (i = array.length - 1; i > 0; i--) {
		random = Math.floor(Math.random() * (i + 1));
		tmp = array[i];
		array[i] = array[random];
		array[random] = tmp;
	}
	return array;
}