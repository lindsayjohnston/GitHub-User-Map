
const placeArea = document.getElementById('location');
const coordinatesText = document.getElementById('coordinates-text')
const citiesText = document.getElementById('cities-text');
let latitude;
let longitude;
const cityBB = { //Hardcoded dummy info for Washington state
    north: 0,
    south: 0,
    east: 0,
    west: 0
}
let citiesArray = [];
const citiesLatLng = [];
const citiesArray2 = []; //Because the cities get processed out of order in GeoCode
const gitHubNumbersArray = [];
// const latLngArray = []; dont think I need this
let map;
let service;
let infoWindow;
//Checks must be true for the next function to fire
let nearbyCitiesCheck = false;
let latLngCheck = false;
let gitHubCheck = false;

document.getElementById('get-map').addEventListener('click', getCityBBCoordinates);
document.getElementById("get-bb").addEventListener('click', getCityBBCoordinates);
document.getElementById('get-nearby-cities').addEventListener('click', getNearbyCities);
document.getElementById('get-latlng').addEventListener('click', getLatLng);
// document.getElementById('get-map').addEventListener('click', getMap);
document.getElementById('get-gh-users').addEventListener('click', getGitHubUsers);


//Change user input to Boundary Box coordinates readable by GeoNames.org
function getCityBBCoordinates() {
    document.getElementById('coordinates-text').textContent = " ";
    for (let i = 0; i < states.length; i++) {
        if (placeArea.value === states[i][0]) {
            cityBB.north = states[i][5];
            cityBB.south = states[i][3];
            cityBB.east = states[i][4];
            cityBB.west = states[i][2];
            break;
        }
    }
    document.getElementById('coordinates-text').textContent += placeArea.value + " " + JSON.stringify(cityBB);

    getNearbyCities();
}

function getNearbyCities() {
    citiesText.textContent = " ";
    const geoNames = new GeoNames;
    geoNames.getNearbyCities(cityBB)
        .then(data => {
            if (data.status !== undefined) {
                alert('There was a problem with the GeoNames server and we will use dummy data to run the App. Sorry about that');
                citiesArray = ["Seattle", "Kennewick", "Tacoma", 'Yakima'];
                citiesArray.forEach(city => {
                    citiesText.textContent += city + " //";
                })

            } else {
                data.geonames.forEach(cityInfo => {
                    citiesArray.push(cityInfo.name);
                    citiesText.textContent += cityInfo.name + " //";
                });
            }
        });

    checkNearbyCities();
}

function checkNearbyCities() {
    if (citiesArray.length === 0) {
        setTimeout(checkNearbyCities, 200);
    } else {
        nearbyCitiesCheck = true;
        getLatLng();
    }
}

function getLatLng() {
    document.getElementById('latlng-text').textContent = " ";
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
    checkLatLng();
}

function checkLatLng() {
    if (citiesLatLng.length === 0) {
        setTimeout(checkLatLng, 200);
    } else {
        latLngCheck = true;
        getGitHubUsers();
    }
}

function getGitHubUsers() { 
    //COMMENTED OUT CODE BC OF GITHUB ERRORS
    
    // const github = new GitHub;
    // citiesArray2.forEach(city => {
    //     let cityNameForURL = city;
    //     //Change City Name to URL format
    //     let cityNameArray = city.split(" ");
    //     if (cityNameArray.length > 1) {
    //         cityNameArray.forEach(function (word, index) {
    //             if (index === 0) {
    //                 cityNameForURL = word;
    //             } else {
    //                 cityNameForURL += "+" + word;
    //             }
    //         })
    //     }
    //     github.getUsersInLocation(cityNameForURL)
    //         .then(data => {
    //             gitHubNumbersArray.push([city, data.location.total_count]);
    //             document.getElementById('users-text').innerText += city + ": " + data.location.total_count + "// ";
    //         })

    // })
    citiesArray.forEach((city)=>{
        gitHubNumbersArray.push([city, 'DummyNumber']);
    })
    checkGitHub();
};

function checkGitHub() {
    if (gitHubNumbersArray.length !== citiesLatLng.length) {
        setTimeout(checkGitHub, 200);
    } else {
        gitHubCheck = true;
        getMap();
    }
}

function getMap() {
    map = new google.maps.Map(
        document.getElementById('map'),
        { center: citiesLatLng[0], zoom: 5 }
    );

    for (let i = 0; i < citiesLatLng.length; i++) {
        let numberOfUsers;
        for (let k = 0; k < gitHubNumbersArray.length; k++) {
            if (citiesArray2[i] === gitHubNumbersArray[k][0]) {
                numberOfUsers = gitHubNumbersArray[k][1];
            }
        }
        createMarker(citiesLatLng[i], citiesArray2[i], numberOfUsers);
    }

}


function createMarker(latLng, cityName, numberOfUsers) {

    let marker = new google.maps.Marker({
        map: map,
        position: latLng,
        animation: google.maps.Animation.DROP,
        title: `${numberOfUsers} GitHub Users in ${cityName}`
    });

    marker.addListener('click', function () {
        infoWindow = new google.maps.InfoWindow({
            content: marker.title
        })
        infoWindow.open(map, marker);
    });


}
