(function($){
    //AJAX calls to follow tags
    //tag input
    let followTag = $("#followTag")
    //the form
    let tagForm = $("#tagForm")
    //the ul we want to add to
    let followingTags = $("#followingTags")

    $(document).ready(function(){
        tagForm.submit(function(event){
            event.preventDefault();
            if(followTag.val().trim().length === 0){
                alert("search term must be non-empty")
            }else{
                $.ajax({                //this is getting the searchTerm from the searchForm
                    method: 'POST', 
                    url: '/tags/'+followTag.val(),
                    success: function(data){
                        followingTags.append(`<li id = ${data}>${followTag.val()}<form action="/utags/${data}" id="follow_form_${data}" method="POST"><button type="submit" id="follow_form_${data}" >Unfollow</button></form></li>`)
                    }

                })
            }
        })
    })

})(window.jQuery)