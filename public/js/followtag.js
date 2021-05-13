(function($){
    //AJAX calls to follow tags
    let followTag = $("#followTag")
    let tagForm = $("#tagForm")
    let followingTags = $("#followingTags")

    $(document).ready(function(){
        tagForm.submit(function(event){
            event.preventDefault();
            if(followTag.val().trim().length === 0){
                alert("search term must be non-empty")
            }else{
                $.ajax({                //this is getting the searchTerm from the searchForm
                    method: 'POST', 
                    url: '/tags'
                    

                }).then(function(data){
                    console.log(data)
                    console.log("hello")
                    alert(`${data} tag has been added to your tags!`)
                    followingTags.append(`<li>${data}</li>`)

            })
        }
    })
    })

})(window.jQuery)