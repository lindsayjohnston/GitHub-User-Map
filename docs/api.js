
class GitHub {
    constructor(){
        this.client_id= '69bf227b826ed24a51b5';
        this.client_secret='6cd283cd0ba25f45102f927520435645baca029f';
        // this.repos_count=5;
        // this.repos_sort='created: asc';
    }

    async getUsersInLocation(city){
        const locationResponse= await fetch(`https://api.github.com/search/users?q=location%3A"${city}"`);


        const location= await locationResponse.json();
        
        return {
            location
        }
    }
}

class GeoNames {
    constructor(){
        this.username='ljohnston10'
    }

    async getNearbyCities(city){
        const citiesResponse= await fetch(`http://api.geonames.org/citiesJSON?north=48&south=45.54&east=-116.915&west=-124.76&maxRows=10&username=ljohnston10`);

        const cities= await citiesResponse.json();

        return cities;
    }
}


// -124.763068	45.543541	-116.915989	49.002494

// http://api.geonames.org/citiesJSON?north=48&south=45.54&east=-116.915&west=-124.76&maxRows=10&username=ljohnston10---mostly washington

//`http://api.geonames.org/citiesJSON?north=${city['north']}&south=${city['south']}&east=${city['east']}&west=${city['west']}&maxRows=10&username=${this.username}`