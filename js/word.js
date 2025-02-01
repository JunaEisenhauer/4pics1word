let levelList = [];
let levelGenerator;

function loadData(resource) {
	return new Promise((resolve, reject) => {
		$.ajax({
			type: "GET",
			url: "res/" + resource,
			dataType: "json",
			success: function (data) {
				// preload images
				$(data).each((i) => {
					$(data[i].images).each(function () {
						(new Image()).src = this;
					});
				});
				Array.prototype.push.apply(levelList, data);
				shuffle(levelList);
				levelGenerator = getNextLevel();
				resolve();
			},
			error: () => reject()
		});
	});
}

function* getNextLevel() {
	for (let i in levelList) {
		yield levelList[i].solution;
		yield levelList[i].images;
	}
}