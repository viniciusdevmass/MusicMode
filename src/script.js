function login(){
    var redirect_uri = "http://127.0.0.1:5502/src/playlists.html"
    var client_id = "b52591c2c6d84beeba2a0499d67d462f"
    var scopes = "playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public user-read-email user-read-private ugc-image-upload";
    window.location.href = `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${scopes}&redirect_uri=${redirect_uri}`
}
//SCOPE: A space-separated list of scopes.If no scopes are specified, authorization will be granted only to access publicly available information: that is, only information normally visible in the Spotify desktop, web, and mobile players.

function paramsult(url){
    
}