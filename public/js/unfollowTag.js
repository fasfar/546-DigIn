(function($){
    //AJAX calls to follow tags
    //the form
    let tagForm = $(".utagForm")

    let unfollowTag = tagForm.input;
    //the ul we want to remove from
    let followingTags = $("#followingTags")

    $(document).ready(function(){
        tagForm.submit(function(event){
            event.preventDefault();
            if(unfollowTag.val().trim().length === 0){
                alert("search term must be non-empty")
            }else{
                $.ajax({                //this is getting the searchTerm from the searchForm
                    method: 'POST', 
                    url: '/utags/'+unfollowTag.val(),
                    success: function(data){
                        element = $('#'+data)
                        followingTags.removeChild(element);
                    }

                })
            }
        })
    })

})(window.jQuery)