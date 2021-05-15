(function($){
    let commentForm = $('#addcomment');

    let addRecipeForm = $('#new_recipe');

    let createUserForm = $('#registration_form');
    let createUserInput = $('.form_input4');

    let loginForm = $('#login_form');
    let loginInput = $('.form_input6');

    commentForm.submit(function (event) {
        $("#addcomment .form_input1").each(function() {
            if(!$(this).val() || $(this).val().trim().length == 0){
                event.preventDefault()
                alert("Inputs must be non-empty");
                return false;
            }
        });
    });

    addRecipeForm.submit(function (event) {
        $("#new_recipe .form_input2").each(function() {
            if(!$(this).val() || $(this).val().trim().length == 0){
                event.preventDefault()
                alert("Inputs must be non-empty");
                return false;
            }
        });
    });

    createUserForm.submit(function (event) {
        $("#registration_form .form_input4").each(function() {
            if(!$(this).val() || $(this).val().trim().length == 0){
                event.preventDefault()
                alert("Inputs must be non-empty");
                return false;
            }
        });
    });

    loginForm.submit(function (event) {
        $("#login_form .form_input6").each(function() {
            if(!$(this).val() || $(this).val().trim().length == 0){
                event.preventDefault()
                alert("Inputs must be non-empty");
            }
        });
    });



})(window.jQuery)