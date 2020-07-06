
const placeArea = document.getElementById('location');
const coordinatesText = document.getElementById('coordinates-text')
const citiesText = document.getElementById('cities-text');
let latitude;
let longitude;
const stateBB = {
    north: 0,
    south: 0,
    east: 0,
    west: 0
}
let currentState;
let citiesArray = [];

//Cities have to be verified in batches becuase of Query limit in Google Geocoder
let batch1=[];
let batch2=[];
let batch3=[];

let verifiedCities=[];
let geoCodeTally=0;
const citiesLatLng = [];
const citiesArray2 = []; //Because the cities get processed out of order in GeoCode
const gitHubNumbersArray = [];
// const latLngArray = []; dont think I need this
//FOR GOOGLE MAPS API
let map;
let service;
let infoWindow;
//Checks must be true for the next function to fire
// let nearbyCitiesCheck = false;
// let latLngCheck = false;
// let gitHubCheck = false;
let usingDummyData = false;

document.getElementById('get-map').addEventListener('click', getStateBBCoordinates);
document.getElementById("get-bb").addEventListener('click', getStateBBCoordinates);
document.getElementById('get-nearby-cities').addEventListener('click', getNearbyCities);
// document.getElementById('get-latlng').addEventListener('click', getLatLng);
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
                citiesArray = ["Seattle WA", "Kennewick WA", "Tacoma WA", 'Yakima WA', 'Richland WA', "Walla Walla WA", 'Olympia WA'];
                currentState = 'WA';
                usingDummyData = true;
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
    // console.log("IN check NearbyCities");
    //citiesArray.length should match number of rows requested from GeoNames API
    if (citiesArray.length !== 30 && !usingDummyData) {
        setTimeout(checkNearbyCities, 200);
    } else {
        // nearbyCitiesCheck = true;
        if (usingDummyData) {
            verifiedCities=citiesArray;
            batch3= citiesArray;
            verifyBatch3();
        } else {
            batchCities();
        }
    }
}

//Cities need to be verified in batches to get around Query limit from Google GeoCode API
function batchCities(){
    let tally=0;
    citiesArray.forEach(city =>{
        if (tally >= 0 && tally < 10){
            batch1.push(city);
        }
        else if (tally >= 10 && tally < 20){
            batch2.push(city);
        } else {
            batch3.push(city);
        }
        tally ++;
    });

    // console.log(batch1 + batch2  + batch3);
    verifyBatch1();
}

function verifyBatch1() {
    console.log("verifying batch1: " + batch1);
    batch1.forEach(city => {
        let geocoderRequest = {
            address: city
        }

        const geocoder = new google.maps.Geocoder();

        geocoder.geocode(geocoderRequest, function (array, status) {   
            if(status === "OVER_QUERY_LIMIT"){
                console.log("Over query limit: " + city);
            } else {
                geoCodeTally ++;
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
                        //IS IT IN THE US?
                        //IS IN THE STATE?
                        let addressComponents = array[0]['address_components'];
                        //address_components is an array of objects with a key "short_name" that could be US for United States or a state abbreviation
                        let isInUS = false;
                        let state;
                        addressComponents.forEach(object => {
                            if (object['short_name'] === 'US') {
                                isInUS = true;
                            }
                            
                            object.types.forEach(type =>{
                                if(type === "administrative_area_level_1"){
                                    state= object["short_name"];
                                }
                            })

    
                            //CHECK IF IS IN SPECIFIED STATE
                            // if (object['short_name'] === currentState) {
                            //     isInState = true;
                            // }
                        })
                        if (isInUS) {
                            verifiedCities.push(`${city} ${state}`);
                            pushLatLng(array);   
                        }
                    }   
                }

            }
            
        });
    });

    setTimeout (verifyBatch2, 10000);
}

function verifyBatch2(){
    console.log("verifying batch2: " + batch2);
    batch2.forEach(city => {
        let geocoderRequest = {
            address: city
        }

        const geocoder = new google.maps.Geocoder();

        geocoder.geocode(geocoderRequest, function (array, status) {   
            if(status === "OVER_QUERY_LIMIT"){
                console.log("Over query limit: " + city);
            } else {
                geoCodeTally ++;
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
                        //IS IT IN THE US?
                        //IS IN THE STATE?
                        let addressComponents = array[0]['address_components'];
                        //address_components is an array of objects with a key "short_name" that could be US for United States or a state abbreviation
                        let isInUS = false;
                        let state;
                        addressComponents.forEach(object => {
                            if (object['short_name'] === 'US') {
                                isInUS = true;
                            }
                            
                            object.types.forEach(type =>{
                                if(type === "administrative_area_level_1"){
                                    state= object["short_name"];
                                }
                            })

    
                            //CHECK IF IS IN SPECIFIED STATE
                            // if (object['short_name'] === currentState) {
                            //     isInState = true;
                            // }
                        })
                        if (isInUS) {
                            verifiedCities.push(`${city} ${state}`);
                            pushLatLng(array);   
                        }
                    }   
                }

            }
            
        });
    });

    setTimeout (verifyBatch3, 10000);
}

function verifyBatch3(){
    console.log("verifying batch3: " + batch3);
    batch3.forEach(city => {
        let geocoderRequest = {
            address: city
        }

        const geocoder = new google.maps.Geocoder();

        geocoder.geocode(geocoderRequest, function (array, status) {   
            if(status === "OVER_QUERY_LIMIT"){
                console.log("Over query limit: " + city);
            } else {
                geoCodeTally ++;
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
                        //IS IT IN THE US?
                        //IS IN THE STATE?
                        let addressComponents = array[0]['address_components'];
                        //address_components is an array of objects with a key "short_name" that could be US for United States or a state abbreviation
                        let isInUS = false;
                        let state;
                        addressComponents.forEach(object => {
                            if (object['short_name'] === 'US') {
                                isInUS = true;
                            }
                            
                            object.types.forEach(type =>{
                                if(type === "administrative_area_level_1"){
                                    state= object["short_name"];
                                }
                            })

    
                            //CHECK IF IS IN SPECIFIED STATE
                            // if (object['short_name'] === currentState) {
                            //     isInState = true;
                            // }
                        })
                        if (isInUS) {
                            verifiedCities.push(`${city} ${state}`);
                            pushLatLng(array);   
                        }
                    }   
                }

            }
            
        });
    });

    checkLatLng()
}


function pushLatLng(array) {
    clearText(document.getElementById('latlng-text'));

    latitude = (array[0].geometry.location.lat());
    longitude = (array[0].geometry.location.lng());
    let cityLatLng = { lat: latitude, lng: longitude };
    citiesLatLng.push(cityLatLng);

    document.getElementById('latlng-text').textContent += "//" + array[0]['formatted_address'] + " Latitude: " + latitude + " Longitude: " + longitude;
}

function checkLatLng() {
    console.log("in check LatLng")
    //make sure that it's had time to get lat/lng for each city
    //what about dummydata?
    if (geoCodeTally !== citiesArray.length) {
        console.log("FALSE: Verified Cities:" + verifiedCities);
        console.log("CitiesLatLNG: " + citiesLatLng);
        setTimeout(checkLatLng, 200);
    } else if (usingDummyData){
        // latLngCheck = true; //is this necesary?
        // getGitHubUsers();

        console.log("TRUE!!: Dummy Data Verified Cities:" + verifiedCities);
        // console.log("CitiesLatLNG: " + citiesLatLng);
        // console.log("citeisArray2: " + citiesArray2);

        //format verifieCities for URLS
        getGitHubUsers();
    } else {
        console.log("TRUE!!: Verified Cities:" + verifiedCities);
        // console.log("CitiesLatLNG: " + citiesLatLng);
        // console.log("citeisArray2: " + citiesArray2);

        //format verifieCities for URLS
        getGitHubUsers();
    }
}

// function formatCityForURL(array){
//     let tempState;
//     let tempCity;
//     let formattedCity = array[0].formatted_address;
//     formattedCity = formattedCity.split(','); //now is an array
//     if (formattedCity.length === 2) {
//         tempCity = city;
//         tempState = currentState;
//     } else if (formattedCity.length === 3) {
//         tempCity = formattedCity[0];
//         let stateArray = formattedCity[1].split(' ');
//         tempState = stateArray[1];
//     } else if (formattedCity.length === 4) {
//         tempCity = formattedCity[0];
//         let stateArray = formattedCity[2].split(' ');
//         tempState = stateArray[1];
//     }
//     // let tempState= formattedCity[1].split(' ');
//     citiesArray2.push(tempCity + " " + tempState);

// }

function getGitHubUsers() {
    clearText(document.getElementById('users-text'));
    const github = new GitHub;
    verifiedCities.forEach((city, index) => {
        let cityNameForURL;
        //Change City Name to URL format
        let cityNameArray = city.split(" ");
        cityNameArray.forEach(function (word, index) {
                if (index === 0) {
                    cityNameForURL = word;
                } else {
                    cityNameForURL += "+" + word;
                }
            })
    
        github.getUsersInLocation(cityNameForURL)
            .then(data => {
                gitHubNumbersArray.push([city, citiesLatLng[index], data.location.total_count]);
                document.getElementById('users-text').innerText += city + ": " + data.location.total_count + "// ";
            })

    })
    // citiesArray.forEach((city)=>{
    //     gitHubNumbersArray.push([city, 'DummyNumber']);
    // })
    checkGitHub();
};

function checkGitHub() {
    if (gitHubNumbersArray.length !== verifiedCities.length) {
        console.log("FAIL GITHUBNUMBERS")
        setTimeout(checkGitHub, 200);
    } else {
        console.log("githubnumbersArray: " + gitHubNumbersArray);
        getTop5(gitHubNumbersArray);
    }
}

function getTop5(array) {
    ///array is [[city, {lat: lng: }, #], ....]
    let top5 = [];
    for (let i = 0; i < array.length; i++) {
        let tally = 0;

        for (let k = i + 1; k < array.length; k++) {
            if (array[i][2] < array[k][2]) {
                tally++;
            }
        }
        if (tally <= (5 - top5.length)) {
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

    for (let i = 0; i < cityArray.length; i++) {
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
