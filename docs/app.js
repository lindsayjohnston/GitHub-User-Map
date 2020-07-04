
const placeArea = document.getElementById('location');
const coordinatesText = document.getElementById('coordinates-text')
const citiesText = document.getElementById('cities-text');
let latitude;
let longitude;
const stateBB = { //Hardcoded dummy info for Washington state
    north: 0,
    south: 0,
    east: 0,
    west: 0
}
let currentState;
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
let usingDummyData= false;

document.getElementById('get-map').addEventListener('click', getStateBBCoordinates);
document.getElementById("get-bb").addEventListener('click', getStateBBCoordinates);
document.getElementById('get-nearby-cities').addEventListener('click', getNearbyCities);
document.getElementById('get-latlng').addEventListener('click', getLatLng);
// document.getElementById('get-map').addEventListener('click', getMap);
document.getElementById('get-gh-users').addEventListener('click', getGitHubUsers);


//Change user input to Boundary Box coordinates readable by GeoNames.org
function clearText(area) {
    area.textContent = '';
}

function getStateBBCoordinates() {
    clearText(document.getElementById('coordinates-text'));
    for (let i = 0; i < states.length; i++) {
        if (placeArea.value === states[i][0]) {
            currentState = states[i][0];
            stateBB.north = states[i][5];
            stateBB.south = states[i][3];
            stateBB.east = states[i][4];
            stateBB.west = states[i][2];
            break;
        }
    }
    document.getElementById('coordinates-text').textContent += placeArea.value + " " + JSON.stringify(stateBB);

    getNearbyCities();
}

function getNearbyCities() {
    clearText(citiesText);
    const geoNames = new GeoNames;
    geoNames.getNearbyCities(stateBB)
        .then(data => {
            if (data.status !== undefined) {
                alert('There was a problem with the GeoNames server and we will use dummy data to run the App. Sorry about that');
                citiesArray = ["Seattle", "Kennewick", "Tacoma", 'Yakima', 'Richland', "Walla Walla", 'Olympia'];
                currentState = 'WA';
                usingDummyData=true;
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
    if (citiesArray.length !== 20 || usingDummyData) {
        setTimeout(checkNearbyCities, 200);
    } else {
        nearbyCitiesCheck = true;
        getLatLng();
    }
}

function getLatLng() {
    clearText(document.getElementById('latlng-text'));
    citiesArray.forEach(city => {
        let geocoderRequest = {
            address: city
        }

        const geocoder = new google.maps.Geocoder();

        geocoder.geocode(geocoderRequest, function (array, status) {
            if (array) {
                //CHECK IF IT'S A CITY
                let placeTypes = array[0].types;
                let isCity = false;
                placeTypes.forEach(function (place) {
                    if (place === 'locality') {
                        isCity = true;
                    }
                })

                if (isCity) {
                    //IS IN THE STATE?
                    let addressComponents= array[0]['address_components'];
                    if(addressComponents[2]['short_name'] === currentState){

                        latitude = (array[0].geometry.location.lat());
                        longitude = (array[0].geometry.location.lng());
                        let cityLatLng = { lat: latitude, lng: longitude };
                        citiesLatLng.push(cityLatLng);
    
                        
                        let tempState;
                        let tempCity;
                        let formattedCity = array[0].formatted_address;
                        console.log(array[0]);
                        formattedCity = formattedCity.split(','); //now is an array
                        if (formattedCity.length === 2) {
                            tempCity = city;
                            tempState = currentState;
                        } else if (formattedCity.length === 3) {
                            tempCity = formattedCity[0];
                            let stateArray = formattedCity[1].split(' ');
                            tempState = stateArray[1];
                        } else if (formattedCity.length === 4) {
                            tempCity = formattedCity[0];
                            let stateArray = formattedCity[2].split(' ');
                            tempState = stateArray[1];
                        }
                        // let tempState= formattedCity[1].split(' ');
                        citiesArray2.push(tempCity + " " + tempState);
                        console.log(citiesArray2);
                        document.getElementById('latlng-text').textContent += "//" + city + " Latitude: " + latitude + " Longitude: " + longitude;
                    }


                }


            }

        })

    })
    console.log(citiesLatLng);
    checkLatLng();
}

function checkLatLng() {
    //make sure that it's had time to get lat/lng for each city
    if (citiesLatLng.length !== citiesArray2.length) {
        setTimeout(checkLatLng, 200);
    } else {
        latLngCheck = true; //is this necesary?
        getGitHubUsers();
    }
}

function getGitHubUsers() {
    //COMMENTED OUT CODE BC OF GITHUB ERRORS
    clearText(document.getElementById('users-text'));
    const github = new GitHub;
    citiesArray2.forEach((city, index) => {
        let cityNameForURL = city;
        //Change City Name to URL format
        let cityNameArray = city.split(" ");
        if (cityNameArray.length > 1) {
            cityNameArray.forEach(function (word, index) {
                if (index === 0) {
                    cityNameForURL = word;
                } else {
                    cityNameForURL += "+" + word;
                }
            })
        }
        github.getUsersInLocation(cityNameForURL)
            .then(data => {
                gitHubNumbersArray.push([city, citiesLatLng[index] ,data.location.total_count]);
                document.getElementById('users-text').innerText += city + ": " + data.location.total_count + "// ";
            })

    })
    // citiesArray.forEach((city)=>{
    //     gitHubNumbersArray.push([city, 'DummyNumber']);
    // })
    checkGitHub();
};

function checkGitHub() {
    if (gitHubNumbersArray.length !== citiesLatLng.length) {
        setTimeout(checkGitHub, 200);
    } else {
        gitHubCheck = true;
        getTop5(gitHubNumbersArray);
    }
}

function getTop5(array) {
    ///array is [[city,{lat: lng: }, #], ....]
    let top5 = [];
    for (let i = 0; i < array.length; i++) {
        let tally = 0;

        for (let k = i + 1; k < array.length; k++) {
            if (array[i][2] < array[k][2]) {
                tally++;
            }
        }
        if (tally <= (5- top5.length)) {
            top5.push(array[i]);
        }
    }
    getMap(top5);
}

function getMap(cityArray) {
    

    map = new google.maps.Map(
        document.getElementById('map'),
        { center: citiesLatLng[0], zoom: 5 }
    );

    for(let i= 0; i< cityArray.length; i++){
        createMarker(cityArray[i][1], cityArray[i][0], cityArray[i][2])
    }

    // for (let i = 0; i < citiesLatLng.length; i++) {
    //     let numberOfUsers;
    //     for (let k = 0; k < gitHubNumbersArray.length; k++) {
    //         if (citiesArray2[i] === gitHubNumbersArray[k][0]) {
    //             numberOfUsers = gitHubNumbersArray[k][1];
    //         }
    //     }
    //     createMarker(citiesLatLng[i], citiesArray2[i], numberOfUsers);
    // }

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
