
class GitHub {
    constructor(){
        this.client_id= '69bf227b826ed24a51b5';
        this.client_secret='6cd283cd0ba25f45102f927520435645baca029f';
        // this.repos_count=5;
        // this.repos_sort='created: asc';
    }

    async getUsersInLocation(city){
        const locationResponse= await fetch(`https://api.github.com/search/users?q=location:{${city}}`);


        const location= await locationResponse.json();
        

        return {
            location
        }
    }
}



