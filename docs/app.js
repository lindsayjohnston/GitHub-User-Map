
const placeArea = document.getElementById('location');
const coordinatesText = document.getElementById('coordinates-text')
const citiesText = document.getElementById('cities-text');
let latitude;
let longitude;
const cityBB = { //Hardcoded for now to be Washington state
    north: 48,
    south: 45.54,
    east: -116.915,
    west: -124.76
}
let citiesArray = ["Seattle", "Kennewick", "Tacoma", 'Yakima'];
const citiesLatLng = [];
const citiesArray2=[]; //The cities get processed out of order in GeoCode
const gitHubNumbersArray = [];
const latLngArray = [];
let map;
let service;
let infoWindow;

document.getElementById("get-bb").addEventListener('click', getCityBBCoordinates);
document.getElementById('get-nearby-cities').addEventListener('click', getNearbyCitiesAndUsers);
document.getElementById('get-latlng').addEventListener('click', getLatLng);
document.getElementById('get-map').addEventListener('click', getMap);

//Change user input to Boundary Box coordinates readable by GeoNames.org
function getCityBBCoordinates() {
    //User input of city
    //output coordinates text
    
    for(let i=0; i<states.length; i++){
        if(placeArea.value === states[i].abbreviation){
            console.log(states[i].name);
        }
    }
    // for (let key in cityBB) {
    //     coordinatesText.textContent += key + ": " + cityBB[key] + "// ";
    // }

}

function getNearbyCitiesAndUsers() {
    const geoNames = new GeoNames;
    geoNames.getNearbyCities(cityBB)
        .then(data => {
            if (data.status !== undefined) {
                alert('There was a problem with the GeoNames server and we will use dummy data to run the App. Sorry about that');
                citiesArray.forEach(city => {
                    placeArea.value = "Seattle";
                    citiesText.textContent += city + " //";
                    // getGitHubUsers(city);
                })

            } else {
                citiesArray=[];
                    
                console.log(citiesArray);
                data.geonames.forEach(cityInfo => {
                    citiesArray.push(cityInfo.name);
                    citiesText.textContent += cityInfo.name + " //";
                    // getGitHubUsers(cityInfo.name)
                });
            }

        });
}

function getGitHubUsers(cityName) {
    const github = new GitHub;
    let cityNameForURL = cityName;
    //Change City Name to URL format
    let cityNameArray = cityName.split(" ");
    if (cityNameArray.length > 1) {
        cityNameArray.forEach(function (word, index) {
            if (index === 0) {
                cityNameForURL = word;
            } else {
                cityNameForURL += "+" + word;
            }
        })
    }
    //Get number of Github users in city
    github.getUsersInLocation(cityNameForURL)
        .then(data => {
            document.getElementById('users-text').innerText += cityNameForURL + ": " + data.location.total_count + "// ";
        })
};

function getLatLng() {
    citiesArray.forEach(city => {
        let geocoderRequest = {
            address: city
        }

        const geocoder = new google.maps.Geocoder();

        geocoder.geocode(geocoderRequest, function (array, status) {
            latitude = (array[0].geometry.location.lat());
            longitude = (array[0].geometry.location.lng());
            let cityLatLng = { lat: latitude, lng: longitude };
            citiesLatLng.push(cityLatLng);
            citiesArray2.push(city);
            document.getElementById('latlng-text').textContent += "//" + city + " Latitude: " + latitude + " Longitude: " + longitude;
        })

    })

    // getMap(citiesLatLng[0], citiesArray);

}

function getMap() {
    map = new google.maps.Map(
        document.getElementById('map'),
        { center: citiesLatLng[0], zoom: 5 }
    );

    for (let i = 0; i < citiesLatLng.length; i++) {
        createMarker(citiesLatLng[i], citiesArray2[i]);
    }

}

//CREATE MAP WITH PLACES LIBRARY







function createMarker(latLng, cityName) {
    
    let marker = new google.maps.Marker({
        map: map,
        position: latLng,
        title: cityName
    });

    marker.addListener('click', function(){
        infoWindow=new google.maps.InfoWindow({
            content: marker.title
        })
        infoWindow.open(map, marker);
    });


}

// CHANGE LOCATION TO LAT/LONG










