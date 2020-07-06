//GET HTML ELEMENTS
const placeArea = document.getElementById('location');
const coordinatesText = document.getElementById('coordinates-text')
const citiesText = document.getElementById('cities-text');

const cityBB= {
    north: 0,
    south: 0,
    east: 0,
    west: 0,
}
let chosenCity;
let citiesArray = [];
let usingDummyData = false;

//Cities have to be verified in batches becuase of Query limit in Google Geocoder
let batch1=[];
let batch2=[];
let batch3=[];

let verifiedCities=[];
let geoCodeTally=0;
let citiesLatLng = [];
let gitHubNumbersArray = [];

//FOR GOOGLE MAPS API
let map;
let service;
let infoWindow;

//LISTEN FOR CLICK TO RUN PROGRAM
document.getElementById('get-map').addEventListener('click', getChosenLatLng);
document.getElementById('city-input').addEventListener('keydown', guessCity);

function guessCity(){
    let cityInput=document.getElementById('city-input');
    let options= {
        types: ['(cities)'],
        componentRestrictions: {country: 'us'}
    };
    let autocomplete= new google.maps.places.Autocomplete(cityInput, options);
}
//THIS IS ONLY USED FOR DEBUGGING 
function clearText(area) {
    area.textContent = '';
}

//RELOAD ALL INFO 
function reloadData(){
    citiesArray = [];
    usingDummyData = false;
    batch1=[];
    batch2=[];
    batch3=[];
    verifiedCities=[];
    geoCodeTally=0;
    citiesLatLng = [];
    gitHubNumbersArray = [];
    chosenCity='';
    clearText(coordinatesText);
    clearText(citiesText);
    clearText(document.getElementById('latlng-text'));
    clearText(document.getElementById('users-text'));
}

function getChosenLatLng(){
    reloadData();
    let input= document.getElementById('city-input').value;
    let inputArray= input.split(', ');
    chosenCity= inputArray[0];
    let state= inputArray[1];
    console.log(inputArray);
    let geocoderRequest= {
        address: input
    }

    const geocoder1 = new google.maps.Geocoder();
    geocoder1.geocode(geocoderRequest, function(array, status){
        geoCodeTally++;
        console.log(array);
        citiesArray.push(`${chosenCity} ${state}`);
        verifiedCities.push(`${chosenCity} ${state}`);
        pushLatLng(array);
    })

    checkChosenLatLng();
    //get latLng for chosen city
    //get cityBBCoordinates 
    //add city to verified cities
    //add latlng to latlng
    //githubnumbersarray?
    //
    //fire off getNearbyCities
}

function checkChosenLatLng(){
    if(verifiedCities.length === 0){
        setTimeout(checkChosenLatLng, 200);
    } else{
        getCityBBCoordinates();
    }
}

//I THINK I HAVE MY UNDERSTANDING OF LAT/LNG SWITCHED BUT IT WORKS
function getCityBBCoordinates(){
    let latitude= citiesLatLng[0]['lat'];
    let longitude= citiesLatLng[0]['lng'];
    cityBB['south']= latitude - 2.5;
    cityBB['north']= latitude + 2.5;
    cityBB['east']= longitude + 4;
    cityBB['west']= longitude -4;

    getNearbyCities(cityBB);
}
// ["WA","Washington",-124.763068,45.543541,-116.915989,49.002494]
// function getStateBBCoordinates() {
//     clearText(document.getElementById('coordinates-text'));
//     reloadData();
//     for (let i = 0; i < states.length; i++) {
//         if (placeArea.value === states[i][0]) {
//             currentState = states[i][0];
//             stateBB.north = states[i][5];
//             stateBB.south = states[i][3];
//             stateBB.east = states[i][4];
//             stateBB.west = states[i][2];
//             break;
//         }
//     }
//     document.getElementById('coordinates-text').textContent += placeArea.value + " " + JSON.stringify(stateBB);

//     getNearbyCities();
// }

function getNearbyCities(bb) {
    clearText(citiesText); //USED FOR DEBUGGING
    
    const geoNames = new GeoNames;
    geoNames.getNearbyCities(bb)
        .then(data => {
            if (data.status !== undefined) {
                alert('There was a problem with the GeoNames server and we will use dummy data surrounding Seattle, WA to run the App. Sorry about that!');
                citiesArray = ["Seattle WA", "Kennewick WA", "Tacoma WA", 'Yakima WA', 'Richland WA', "Walla Walla WA", 'Olympia WA'];
                currentState = 'WA';
                usingDummyData = true;
                citiesLatLng=[];
                verifiedCities=[];
                citiesArray.forEach(city => {
                    citiesText.textContent += city + " //";
                })
            } else {
                data.geonames.forEach(cityInfo => {
                    if(cityInfo.name !== chosenCity){
                        citiesArray.push(cityInfo.name);
                        citiesText.textContent += cityInfo.name + " //";
                    }
                });
            }
        });
    checkNearbyCities();
}

function checkNearbyCities() {
    //citiesArray.length should match number of rows requested from GeoNames API
    if (citiesArray.length !== 29 && !usingDummyData) {
        setTimeout(checkNearbyCities, 200);
    } else {
        if (usingDummyData) {
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
    verifyBatch1();
}

function verifyBatch1() {
    batch1.forEach(city => {
        let geocoderRequest = {
            address: city
        }
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode(geocoderRequest, function (array, status) {   
            if(status === "OVER_QUERY_LIMIT"){ //USED FOR DEBUGGING
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
    clearText(document.getElementById('latlng-text')); //USED FOR DEBUGGING
    let latitude;
    let longitude;

    latitude = (array[0].geometry.location.lat());
    longitude = (array[0].geometry.location.lng());
    let cityLatLng = { lat: latitude, lng: longitude };
    citiesLatLng.push(cityLatLng);
    //USED FOR DEBUGGING
    document.getElementById('latlng-text').textContent += "//" + array[0]['formatted_address'] + " Latitude: " + latitude + " Longitude: " + longitude;
}

//make sure that it's had time to get lat/lng for each city
function checkLatLng() {
    if (geoCodeTally !== (citiesArray.length + 1)) {
        console.log("GeoCoder still verifying cities...");
        setTimeout(checkLatLng, 200);
    } else {
        getGitHubUsers();
    }
}

function getGitHubUsers() {
    clearText(document.getElementById('users-text')); //USED FOR DEBUGGING
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
    checkGitHub();
};

//GET NUMBER OF GITHUB USERS FOR EACH VERIFIED CITY
function checkGitHub() {
    if (gitHubNumbersArray.length !== verifiedCities.length) {
        console.log("Still fetching GitHub numbers...")
        setTimeout(checkGitHub, 200);
    } else {
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
        if (tally <= (4 - top5.length)) {
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

}

function createMarker(latLng, cityName, numberOfUsers) {
    //FORMAT CITY AS "CITY, STATE"
    let cityArray= cityName.split(" ");
    let formattedCity=cityArray[0];
    for (let i=1; i < cityArray.length; i++){
        if( i === cityArray.length- 1){
            formattedCity += `, ${cityArray[i]}`;
        } else {
            formattedCity+= ` ${cityArray[i]}`;
        }
    }

    let marker = new google.maps.Marker({
        map: map,
        position: latLng,
        animation: google.maps.Animation.DROP,
        title: `${numberOfUsers} GitHub Users in ${formattedCity}`
    });

    marker.addListener('click', function () {
        infoWindow = new google.maps.InfoWindow({
            content: marker.title
        })
        infoWindow.open(map, marker);
    });
}
