// TOKEN AND SECRET NO LONGER WORK


// class GitHub {
//     constructor(){
//         this.client_id= 'Iv1.a8d901da9a22e78e';
//         this.client_secret='4f7b41088963d747c483237cc7e9b0744d649a70';
//         this.user_token='274aeb5735c53a7149d2339ddf837aafde5c9418';
//     } //

//     // https://api.github.com/users/${user}?client_id=${this.client_id}&client_secret=${this.client_secret}`

//     async getUsersInLocation(city){
//         const locationResponse= await fetch(`https://api.github.com/search/users?q=location%3A"${city}"`, {
//             headers: new Headers ({
//                 Authorization: `token ${this.user_token}` 
//             })
//         });


//         const location= await locationResponse.json();
        
//         return {
//             location  //location.total_count
//         }
//     }
// }

class GeoNames {
    constructor(){
        this.username='ljohnston10'
    }

    async getNearbyCities(city){
        const citiesResponse= await fetch(`http://api.geonames.org/citiesJSON?north=${city.north}&south=${city.south}&west=${city.west}&east=${city.east}&maxRows=10&username=ljohnston10`);

        const cities= await citiesResponse.json(); 

        return cities;
    }
}


// -124.763068	45.543541	-116.915989	49.002494

// http://api.geonames.org/citiesJSON?north=48&south=45.54&east=-116.915&west=-124.76&maxRows=10&username=ljohnston10---mostly washington

//`http://api.geonames.org/citiesJSON?north=${city['north']}&south=${city['south']}&east=${city['east']}&west=${city['west']}&maxRows=10&username=${this.username}`
