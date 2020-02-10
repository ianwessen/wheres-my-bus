// http://webservices.nextbus.com/service/publicJSONFeed?command=predictions&a=sf-muni&stopId=15385&routeTag=5
// Baker & McAllister (Inbound): stopId=15385
// Fulton & Masonic (Inbound): stopId=14230
// routeTag=5
// routeTag=5R

const CONSTANT = {
	AGENCY_ID: "sf-muni",
	STOP_ID_FULTON_MASONIC_INBOUND: "14230",
	STOP_TAG_FULTON_MASONIC_INBOUND: "4230",
	STOP_ID_MCALLISTER_BAKER_INBOUND: "15385",
	STOP_TAG_MCALLISTER_BAKER_INBOUND: "5385"
};

const setPolling = (callback, interval) => {
	setTimeout(() => {
		setPolling(callback, interval);
	}, interval);
};

// fetchResult []
// predictions {}
// direction [], {}, undefined
// prediction [], {}
// minutes ""

const parseResponse = response => {
	// console.log("raw response", response);
	const result = response
		// Get just predictions data
		.map(i => i.predictions)
		.map(predictions => {
			// Each "predictions" object is a Route*Bus combo
			let result = [];
			// Check that direction exists
			if (predictions.direction) {
				if (predictions.direction.prediction) {
					// If one direction (destination):
					result = predictions.direction.prediction;
				} else {
					// Else multiple directions (destinations):
					result = predictions.direction.map(d => d.prediction).flat();
				}
			}
			// Append routeTag and stopTag for sorting
			result.map(r => {
				r.routeTag = predictions.routeTag;
				r.stopTag = predictions.stopTag;
				return r;
			});
			return result;
		})
		// Flattens all stops
		.flat()
		// Pluck the useful fields, discard the rest
		.map(({ minutes, vehicle, routeTag, stopTag }) => ({
			minutes,
			vehicle,
			routeTag,
			stopTag
		}));
	return result;
};

const createRouteTagNode = routeTag => {
	let routeTagNode = document.createElement("p");
	routeTagNode.classList = "prediction-route";
	routeTagNode.innerText = `${routeTag}`;
	return routeTagNode;
};

const createMinutesNode = minutes => {
	let minutesNode = document.createElement("p");
	minutesNode.classList = "prediction-time";
	minutesNode.innerText = `${minutes} minute${minutes === "1" ? "" : "s"}`;
	return minutesNode;
};

const createVehicleNode = vehicle => {
	let vehicleNode = document.createElement("p");
	vehicleNode.classList = "prediction-vehicle";
	vehicleNode.innerText = `Vehicle #${vehicle}`;
	return vehicleNode;
};

const createPredictionNode = prediction => {
	let predictionDiv = document.createElement("div");
	predictionDiv.classList = "prediction js-prediction";

	let routeTagNode = createRouteTagNode(prediction.routeTag);
	predictionDiv.appendChild(routeTagNode);

	let minutesNode = createMinutesNode(prediction.minutes);
	predictionDiv.appendChild(minutesNode);

	let vehicleNode = createVehicleNode(prediction.vehicle);
	predictionDiv.appendChild(vehicleNode);

	return predictionDiv;
};

const removeStalePredictions = () => {
	document.querySelectorAll(".js-prediction").forEach(prediction => {
		prediction.remove();
	});
};

const isMasonicStop = p =>
	p.stopTag === CONSTANT.STOP_TAG_FULTON_MASONIC_INBOUND;
const isBakerStop = p =>
	p.stopTag === CONSTANT.STOP_TAG_MCALLISTER_BAKER_INBOUND;
const sortByMinutesAsc = (a, b) => Number(a.minutes) > Number(b.minutes);

const updateView = predictions => {
	removeStalePredictions();

	let masonicList = document.querySelector(".js-prediction-list-masonic");
	predictions
		.filter(isMasonicStop)
		.sort(sortByMinutesAsc)
		.slice(0, 3)
		.forEach(prediction => {
			let predictionNode = createPredictionNode(prediction);
			masonicList.appendChild(predictionNode);
		});

	let bakerList = document.querySelector(".js-prediction-list-baker");
	predictions
		.filter(isBakerStop)
		.sort(sortByMinutesAsc)
		.slice(0, 3)
		.forEach(prediction => {
			let predictionNode = createPredictionNode(prediction);
			bakerList.appendChild(predictionNode);
		});
};

async function getBusPredictions() {
	try {
		var data = await Promise.all([
			fetch(
				"http://webservices.nextbus.com/service/publicJSONFeed?command=predictions&a=sf-muni&stopId=15385&routeTag=5"
			).then(response => response.json()),
			fetch(
				"http://webservices.nextbus.com/service/publicJSONFeed?command=predictions&a=sf-muni&stopId=14230&routeTag=5"
			).then(response => response.json()),
			fetch(
				"http://webservices.nextbus.com/service/publicJSONFeed?command=predictions&a=sf-muni&stopId=14230&routeTag=5R"
			).then(response => response.json())
		]);
	} catch (error) {
		console.error(error);
	}

	const formattedPredictionData = parseResponse(data);

	return formattedPredictionData;
}
