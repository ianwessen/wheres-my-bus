const setPolling = (callback, interval) => {
	setTimeout(() => {
		setPolling(callback, interval);
	}, interval);
};

const parseNextBusResponse = predictionJsonResponse => {
	// Note:
	// It looks like SFMuni changes the type of
	// 'direction' when there are multiple inbound directions
	// such as in the case of temporary transbay terminal
	// TODO: Add more defensive type checking here
	const inboundPredictions = predictionJsonResponse.predictions.direction.prediction
		.slice(0, 3)
		.map(({ minutes, vehicle }) => ({ minutes, vehicle }));
	return inboundPredictions;
};

const createPredictionTimeNode = minutes => {
	let predictionTimeNode = document.createElement("p");
	predictionTimeNode.classList = "prediction-time";
	predictionTimeNode.innerText = `${minutes} minutes`;
	return predictionTimeNode;
};

const createPredictionVehicleNode = vehicle => {
	let predictionVehicleNode = document.createElement("p");
	predictionVehicleNode.classList = "prediction-vehicle";
	predictionVehicleNode.innerText = `Vehicle #${vehicle}`;
	return predictionVehicleNode;
};

const createPredictionNode = (minutes, vehicle) => {
	let predictionDiv = document.createElement("div");
	predictionDiv.classList = "prediction js-prediction";

	let predictionTimeNode = createPredictionTimeNode(minutes);
	predictionDiv.appendChild(predictionTimeNode);

	let predictionVehicleNode = createPredictionVehicleNode(vehicle);
	predictionDiv.appendChild(predictionVehicleNode);

	return predictionDiv;
};

const removeStalePredictions = () => {
	document.querySelectorAll(".js-prediction").forEach(prediction => {
		prediction.remove();
	});
};

const appendPrediction = predictionNode => {
	let list = document.querySelector(".js-prediction-list");
	list.appendChild(predictionNode);
};

const getBusPredictions = () => {
	return fetch(
		"http://webservices.nextbus.com/service/publicJSONFeed?command=predictions&a=sf-muni&stopId=15385&routeTag=5"
	)
		.then(response => response.json())
		.then(parseNextBusResponse)
		.then(predictions => {
			return predictions.map(prediction => {
				return createPredictionNode(prediction.minutes, prediction.vehicle);
			});
		});
};
