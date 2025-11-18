if ("serviceWorker" in navigator) {
    console.log("Puedes usar los Service Workers del navegador");
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./sw.js")
            .then((res) => console.log("[PWA] Service Worker cargado correctamente", res))
            .catch((err) => console.error("[PWA] Error al registrar SW:", err));
    });
}else{
    console.log("No puedes usar los serviceWorkers del navegador");
}

$(document).ready(function(){
    $("#menu a").click(function(e){
        e.preventDefault();
        
        $("html, body").animate({
            scrollTop: $($(this).attr("href")).offset().top
        });
        return false;
    });
})  