
class GitHub {
    constructor(){
        
    } //

    // https://api.github.com/users/${user}?client_id=${this.client_id}&client_secret=${this.client_secret}`

    async getUsersInLocation(city){
        const locationResponse= await fetch(`https://api.github.com/search/users?q=location%3A"${city}"`, {
            headers: new Headers ({
                Authorization: `token ${this.user_token}`,
                Accept: `application/vnd.github.v3+json` 
            })
        });


        const location= await locationResponse.json();
        
        return {
            location  //location.total_count
        }
    }
}

class GeoNames {
    constructor(){
        this.username='ljohnston10'
    }

    async getNearbyCities(state){
        const citiesResponse= await fetch(`http://api.geonames.org/citiesJSON?north=${state.north}&south=${state.south}&west=${state.west}&east=${state.east}&maxRows=29&username=ljohnston10`);

        const cities= await citiesResponse.json(); 

        return cities; //pretty much in order of greatest population to least
    }
}

// class AutoComplete {
//     constructor(){
//         this.key= 'AIzaSyDTpoS8vDEyT-e0D0rDKBO1VOrs0EiVYyo';
//     }
//     async getCity(input){
//         const getCityResponse= await fetch (`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${this.key}`);

//         const city= await getCityResponse();

//         return city;
//     }
// }


// -124.763068	45.543541	-116.915989	49.002494

// http://api.geonames.org/citiesJSON?north=48&south=45.54&east=-116.915&west=-124.76&maxRows=10&username=ljohnston10---mostly washington

//`http://api.geonames.org/citiesJSON?north=${city['north']}&south=${city['south']}&east=${city['east']}&west=${city['west']}&maxRows=10&username=${this.username}`