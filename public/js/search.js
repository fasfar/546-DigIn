(function($){
    //AJAX calls for recipe search
    let  searchTerm = $('#recipeSearch');
    let searchForm = $('#recipeForm');
    let recipeResult = $('#searchResults');
    let recipe = $('recipe');
    let allRecipes = $("#allRecipes")
    $(document).ready(function(){
        searchForm.submit(function(event){
            event.preventDefault();
            if(searchTerm.val().trim().length === 0){
                alert("search term must be non-empty")
            }
            else{
                console.log("in search")
                $.ajax({                //this is getting the searchTerm from the searchForm
                    method: 'POST', 
                    url: '/recipes/search/'+ searchTerm.val(),
                    

                }).then(function(data){     //should this be a get request??
                    console.log(data)
                    allRecipes.attr("hidden", "true")
                    recipeResult.removeAttr('hidden');
                    recipeResult.html(data)
                })
            }
        })
    })

})(window.jQuery)