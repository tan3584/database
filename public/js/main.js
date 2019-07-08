$(document).ready(function(){
    $('.delete-user').on('click', function(e){
        $target = $(e.target);
        const buttonId = ($target.attr('data-id'));
        $.ajax({
            type: 'DELETE',
            url: '/users/'+ buttonId,
            success: function(response){
            window.location.href='/';
            },
            error: function(err){
                console.log(err);
            }
        })
    });
});