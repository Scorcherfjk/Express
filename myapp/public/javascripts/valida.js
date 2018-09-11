$(() => {
    $("#email").keyup(function(){
        var a = $(this).val();
        $("#usuario").val(a);
    })

    $("#carga").hide();
    $("#confirmarClave").keyup(function(){
        if ($("#clave").val() == $(this).val() && $(this).val() != "" ){
            $("#carga").show();
        }else{
            $("#carga").hide();
        }
    })
    
    $("#clave").keyup(function(){
        if ($("#confirmarClave").val() == $(this).val() && $(this).val() != "" ){
            $("#carga").show();
        }else{
            $("#carga").hide();
        }
    })
})