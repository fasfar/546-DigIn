(function($){
    //AJAX calls for recipe search
    let  searchTerm = $('#recipeSearch');
    let searchForm = $('#recipeForm');
    let recipeResult = $('#searchResults');
    let recipe = $('recipe');
    let allRecipes = $("#allRecipes")
    let searchMethod = "tag"
    $(document).ready(function(){
        $("#searchType").on('change', function(){
            searchMethod = $(this).val();
            //console.log($(this).val())
        })
        console.log(searchMethod)

        searchForm.submit(function(event){
            event.preventDefault();
            if(searchTerm.val().trim().length === 0){
                alert("search term must be non-empty")
            }
            else{
                console.log("in search")
                if(searchMethod == "tag"){
                    $.ajax({                //this is getting the searchTerm from the searchForm
                        method: 'POST', 
                        url: '/recipes/searchByTag/'+ searchTerm.val(),
                        
    
                    }).then(function(data){     //should this be a get request??
                        console.log(data)
                        allRecipes.attr("hidden", "true")
                        recipeResult.removeAttr('hidden');
                        recipeResult.html(data)
                    })

                }else if( searchMethod == "recipeName"){
                    $.ajax({
                        method: 'POST',
                        url: '/recipes/searchByRecipeName/' + searchTerm.val()
                    }).then(function(data){
                        allRecipes.attr("hidden", "true")
                        recipeResult.removeAttr('hidden');
                        recipeResult.html(data)
                    })
                }else if( searchMethod == "author"){
                    $.ajax({
                        method: 'POST', 
                        url: '/recipes/searchByAuthor/' + searchTerm.val()
                    }).then(function(data){
                        allRecipes.attr("hidden", "true")
                        recipeResult.removeAttr('hidden');
                        recipeResult.html(data)
                    })
                }
               
            }
        })
    })

})(window.jQuery)