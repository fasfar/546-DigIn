(function($){
    let commentForm = $('#addcomment');
    let commentInput = $(".form_input1");

    let addRecipeForm = $('#new_recipe');
    let addRecipeInput = $('.form_input2');

    let createUserForm = $('#create_user');
    let createUserInput = $('.form_input4');

    let loginForm = $('#login_form');
    let loginInput = $('.form_input6');

    commentForm.submit(function (event) {
        if(!commentInput.val() || commentInput.val().trim().length == 0){
            event.preventDefault();
            alert("Inputs must be non-empty")
        }
    });

    addRecipeForm.submit(function (event) {
        if(!addRecipeInput.val() || addRecipeInput.val().trim().length == 0){
            event.preventDefault();
            alert("Inputs must be non-empty")
        }
    });

    createUserForm.submit(function (event) {
        if(!createUserInput.val() || createUserInput.val().trim().length == 0){
            event.preventDefault();
            alert("Inputs must be non-empty")
        }
    });

    loginForm.submit(function (event) {
        if(!loginInput.val() || loginInput.val().trim().length == 0){
            event.preventDefault();
            alert("Inputs must be non-empty")
        }
    });



})(window.jQuery)