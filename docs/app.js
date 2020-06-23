
const place = document.getElementById('location');
const cityDisplay = document.getElementById('city-display');
let latitude;
let longitude;


document.getElementById('form').addEventListener('submit', getOutput);


///DISPLAY NUMBER OF GITHUB USERS FOR LOCATION
function getOutput(event) {
    const github = new GitHub;
    cityDisplay.innerText = `Number of GitHub users in ${place.value}:`;
    github.getUsersInLocation(place.value)
        .then(data => {
            document.getElementById('output').innerText = data.location.total_count;
        })
    getLatLng(place.value);
    event.preventDefault();
}

//CHANGE LOCATION TO LAT/LONG
function getLatLng(place) {
    const script = document.getElementById('location-script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDTpoS8vDEyT-e0D0rDKBO1VOrs0EiVYyo&callback=getLocation';

    window.getLocation = function () {
        let geocoderRequest = {
            address: place
        }

        const Geocoder = new google.maps.Geocoder();


        Geocoder.geocode(geocoderRequest, function (array, status) {
            latitude = (array[0].geometry.location.lat());
            longitude = (array[0].geometry.location.lng());
            createMap(latitude, longitude);
        })
        
    }

    
}




/////MAP
function createMap(latitude, longitude) {
    const script = document.getElementById('map-script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDTpoS8vDEyT-e0D0rDKBO1VOrs0EiVYyo&callback=initMap';

    window.initMap = function () {
        let map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: latitude, lng: longitude },
            zoom: 5
        })
    }
}






