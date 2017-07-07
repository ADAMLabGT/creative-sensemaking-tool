var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function submitForm() {
    var url = $("#url").val();
    localStorage["url"] = JSON.stringify(url);
    window.location = "index.html";
}
