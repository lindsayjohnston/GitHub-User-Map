
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
            location  
        }
    }
}

class GeoNames {
    constructor(){
        
    }

    async getNearbyCities(state){
        const citiesResponse= await fetch(`http://api.geonames.org/citiesJSON?north=${state.north}&south=${state.south}&west=${state.west}&east=${state.east}&maxRows=9&username=${this.username}`);

        const cities= await citiesResponse.json(); 

        return cities; //pretty much in order of greatest population to least
    }
}

