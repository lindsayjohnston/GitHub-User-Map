
const cityBB = {
    north: 0,
    south: 0,
    east: 0,
    west: 0,
}
let chosenCity;
let chosenState;
let citiesArray = [];
let usingDummyData = false;

//Cities have to be verified in batches becuase of Query limit in Google Geocoder
let batch1 = [];
let batch2 = [];
let batch3 = [];

let verifiedCities = [];
let geoCodeTally = 0;
let citiesLatLng = [];
let gitHubNumbersArray = [];

//FOR GOOGLE MAPS API
let map;
let service;
let infoWindow;

//LISTEN FOR CLICK TO RUN PROGRAM
document.getElementById('get-map').addEventListener('click', getChosenLatLng);
document.getElementById('city-input').addEventListener('keydown', guessCity);

function guessCity() {
    let cityInput = document.getElementById('city-input');
    let options = {
        types: ['(cities)'],
        componentRestrictions: { country: 'us' }
    };
    let autocomplete = new google.maps.places.Autocomplete(cityInput, options);
}
//THIS IS ONLY USED FOR DEBUGGING DIVS (CURRENTLY HIDDEN)
function clearText(area) {
    area.textContent = '';
}

function unhideElement(element){
    element.classList.remove('hidden');
}

function hideElement(element){
    element.classList.add('hidden');
}

function addSpinner(element, message){
    element.innerHTML += `${message} <i id="spinner" class="fa fa-spinner fa-pulse" aria-hidden="true"></i>`
}

function addCheck(element){
    document.getElementById('spinner').remove();
    element.innerHTML += '<i class="far fa-check-circle"></i><br>';
}



//RELOAD ALL INFO 
function reloadData() {
    citiesArray = [];
    usingDummyData = false;
    batch1 = [];
    batch2 = [];
    batch3 = [];
    verifiedCities = [];
    geoCodeTally = 0;
    citiesLatLng = [];
    gitHubNumbersArray = [];
    chosenCity = '';
    document.getElementById('map').innerHTML='';
    document.getElementById('message').innerHTML='';
}

function getChosenLatLng() {
    reloadData();
     //START FETCHING NEARBY CITIES SPINNER
    addSpinner(document.getElementById('message'), "Fetching coordinates of chosen city");
    let input = document.getElementById('city-input').value;
    let inputArray = input.split(', ');
    chosenCity = inputArray[0];
    chosenState = inputArray[1];
    let geocoderRequest = {
        address: input
    }

    const geocoder1 = new google.maps.Geocoder();
    geocoder1.geocode(geocoderRequest, function (array, status) {
        citiesArray.push(chosenCity + " " + chosenState);
        verifiedCities.push(chosenCity + " " + chosenState);
        pushLatLng(array);
    })

    checkChosenLatLng();
}

function checkChosenLatLng() {
    //ONCE GEOCODER GETS LATLNG FOR CHOSEN CITY, VERIFIEDCITIES.LENGTH WILL = 1
    if (citiesLatLng.length === 0) {
        setTimeout(checkChosenLatLng, 200);
    } else {
        addCheck(document.getElementById('message'));
        getCityBBCoordinates();
    }
}

//I THINK I HAVE MY UNDERSTANDING OF LAT/LNG SWITCHED BUT IT WORKS
function getCityBBCoordinates() {
    let latitude = citiesLatLng[0]['lat'];
    let longitude = citiesLatLng[0]['lng'];
    cityBB['south'] = latitude - 2.5;
    cityBB['north'] = latitude + 2.5;
    cityBB['east'] = longitude + 4;
    cityBB['west'] = longitude - 4;

    getNearbyCities(cityBB);
}


function getNearbyCities(bb) {
    // clearText(citiesText); //USED FOR DEBUGGING
    addSpinner(document.getElementById('message'), "Fetching nearby cities.");
    const geoNames = new GeoNames;
    geoNames.getNearbyCities(bb)
        .then(data => {
            if (data.status !== undefined) {
                alert('There was a problem with the GeoNames server and we will use dummy data surrounding Seattle, WA to run the App. Sorry about that!');
                citiesArray = ["Seattle WA", "Kennewick WA", "Tacoma WA", 'Yakima WA', 'Richland WA', "Walla Walla WA", 'Yakima WA'];
                usingDummyData = true;
                document.getElementById('city-input').value= "Seattle, WA, USA"
                geoCodeTally = 0;
                chosenCity = 'Seattle';
                chosenState = 'WA';
                citiesLatLng = [];
                verifiedCities = [];
                citiesArray.forEach(city => {
                    citiesText.textContent += city + " //";
                })
            } else {
                data.geonames.forEach(cityInfo => {
                    //populate citiesarray with wikipedia search name from Geonames wiki
                    //EX: en.wikipedia.org/wiki/Tacoma%2C_Washington
                    //EX: en.wikipedia.org/wiki/Seattle
                    let cityName;
                    let cityStateWiki = cityInfo.wikipedia;
                    if (cityStateWiki !== "") {
                        let wikiArray = cityStateWiki.split('/');
                        let cityURLFormat = wikiArray[2];
                        let cityNameArray1 = cityURLFormat.split("%2C_"); //get rid of %2C
                        let cityNameArray2 = []; //get rid of _
                        cityNameArray1.forEach(word => {
                            let wordArray = word.split('_');
                            wordArray.forEach(smallWord => {
                                cityNameArray2.push(smallWord);
                            })
                        })
                        cityName = cityNameArray2.join(" ");

                    } else {
                        cityName = cityInfo.name;
                    }
                    citiesArray.push(cityName);
                });
            }
        });
    checkNearbyCities();
}

function checkNearbyCities() {
    //citiesArray.length should match number of rows requested from GeoNames API
    if (citiesArray.length !== 30 && !usingDummyData) {
        setTimeout(checkNearbyCities, 200);
    } else {
        addCheck(document.getElementById('message'));
        if (usingDummyData) {
            batch3 = citiesArray;
            verifyBatch3();
        } else {
            batchCities();
        }
    }
}

//Cities need to be verified in batches to get around Query limit from Google GeoCode API
function batchCities() {
    let tally = 0;
    citiesArray.forEach(city => {
        if (tally >= 0 && tally < 10) {
            batch1.push(city);
        }
        else if (tally >= 10 && tally < 20) {
            batch2.push(city);
        } else {
            batch3.push(city);
        }
        tally++;
    });
    verifyBatch1();
}

function verifyBatch1() {
    addSpinner(document.getElementById('message'), "Verifying first batch of cities");
    batch1.forEach(city => {
        let geocoderRequest = {
            address: city
        }
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode(geocoderRequest, function (array, status) {
            if (status === "OVER_QUERY_LIMIT") { //USED FOR DEBUGGING
                console.log("Over query limit: " + city);
            } else {
                geoCodeTally++;
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
                        //GET CITY/STATE NAME
                        let state;
                        let city;
                        let addressComponents = array[0]['address_components'];
                        addressComponents.forEach(component => {
                            component.types.forEach(type => {
                                if (type === 'locality') {
                                    city = component['long_name'];
                                }
                                if (type === 'administrative_area_level_1') {
                                    state = component['short_name'];
                                }
                            })
                        })

                        verifiedCities.push(`${city} ${state}`);
                        pushLatLng(array);
                    }
                }
            }
        });
    });
    setTimeout(verifyBatch2, 10000);
}

function verifyBatch2() {
    addCheck(document.getElementById('message'));
    addSpinner(document.getElementById('message'), "Verifying second batch of cities");
    batch2.forEach(city => {
        let geocoderRequest = {
            address: city
        }
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode(geocoderRequest, function (array, status) {
            if (status === "OVER_QUERY_LIMIT") {
                console.log("Over query limit: " + city);
            } else {
                geoCodeTally++;
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
                        //GET CITY/STATE NAME
                        let state;
                        let city;
                        let addressComponents = array[0]['address_components'];
                        addressComponents.forEach(component => {
                            component.types.forEach(type => {
                                if (type === 'locality') {
                                    city = component['long_name'];
                                }
                                if (type === 'administrative_area_level_1') {
                                    state = component['short_name'];
                                }
                            })
                        })

                        verifiedCities.push(`${city} ${state}`);
                        pushLatLng(array);
                    }
                }
            }
        });
    });
    setTimeout(verifyBatch3, 10000);
}

function verifyBatch3() {
    addCheck(document.getElementById('message'));
    addSpinner(document.getElementById('message'), "Verifying third batch of cities");
    batch3.forEach(city => {
        let geocoderRequest = {
            address: city
        }
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode(geocoderRequest, function (array, status) {
            if (status === "OVER_QUERY_LIMIT") {
                console.log("Over query limit: " + city);
            } else {
                geoCodeTally++;
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
                        //GET CITY/STATE NAME
                        let state;
                        let city;
                        let addressComponents = array[0]['address_components'];
                        addressComponents.forEach(component => {
                            component.types.forEach(type => {
                                if (type === 'locality') {
                                    city = component['long_name'];
                                }
                                if (type === 'administrative_area_level_1') {
                                    state = component['short_name'];
                                }
                            })
                        })

                        verifiedCities.push(`${city} ${state}`);
                        pushLatLng(array);
                    }
                }
            }
        });
    });
    checkLatLng()
}

function pushLatLng(array) {
    let latitude = (array[0].geometry.location.lat());
    let longitude = (array[0].geometry.location.lng());
    let cityLatLng = { lat: latitude, lng: longitude };
    citiesLatLng.push(cityLatLng);
}

//make sure that it's had time to get lat/lng for each city
function checkLatLng() {
    if (geoCodeTally !== (citiesArray.length)) {
        console.log("GeoCoder still verifying cities...");
        setTimeout(checkLatLng, 200);
    } else {
        deleteCityDuplicates();
    }
}

function deleteCityDuplicates() {
    verifiedCities.forEach((city, index) => {
        for (let i = index + 1; i < verifiedCities.length; i++) {
            if (verifiedCities[i] === city) {
                verifiedCities.splice(i, 1);
                citiesLatLng.splice(i, 1);
            }
        }
    })
    console.log(verifiedCities);
    console.log(citiesLatLng);    
    getGitHubUsers();
}

function getGitHubUsers() {
    addCheck(document.getElementById('message'));
    addSpinner(document.getElementById('message'), "Getting GitHub Users");
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
            })

    })
    console.log(gitHubNumbersArray);
    checkGitHub();
};

//GET NUMBER OF GITHUB USERS FOR EACH VERIFIED CITY
function checkGitHub() {
    if (gitHubNumbersArray.length !== verifiedCities.length) {
        console.log("Still fetching GitHub numbers...")
        setTimeout(checkGitHub, 200);
    } else {
        addCheck(document.getElementById('message'));
        getTop5(gitHubNumbersArray);
    }
}


function getTop5(array) {
    ///array is [[city, {lat: lng: }, #], ....]
    let top5 = [];
    //make sure chosen city is displayed
    let chosenIndex; 
    array.forEach((cityArray, index) =>{
        if(cityArray[0] === chosenCity + " " + chosenState){
            top5.push(cityArray);
            chosenIndex= index;
        }
    })

    for (let i = 0; i < array.length; i++) {
        //AVOID COUNTING CHOSEN CITY AGAIN
        if(i !== chosenIndex){
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
    }
    getMap(top5);
}

function getMap(cityArray) {
    map = new google.maps.Map(
        document.getElementById('map'),
        { center: cityArray[0][1], zoom: 6 }
    );

    for (let i = 0; i < cityArray.length; i++) {
        createMarker(cityArray[i][1], cityArray[i][0], cityArray[i][2])
    }

}

function createMarker(latLng, cityName, numberOfUsers) {
    //FORMAT CITY AS "CITY, STATE"
    let cityArray = cityName.split(" ");
    let formattedCity = cityArray[0];
    for (let i = 1; i < cityArray.length; i++) {
        if (i === cityArray.length - 1) {
            formattedCity += `, ${cityArray[i]}`;
        } else {
            formattedCity += ` ${cityArray[i]}`;
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
