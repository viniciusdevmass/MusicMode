import SpotifyApi from "../api/spotifyApi.js";
console.log('entrou')
let params = new URLSearchParams(document.location.search)
let code = params.get("code")
console.log(`code + ${code}`)

//get Token
await SpotifyApi.getToken(code)

//Search artists and tracks
window.getSearch = async function() {
  const query = document.getElementById('query').value;
  await SpotifyApi.searchSpotify(query);
};

//Create playlist recomendations
document.getElementById('generateBtn').addEventListener('click', async () => {
  await SpotifyApi.saveRecommendations2();
})












//Limpa o filtro ao mudar o select
document.getElementById('type').addEventListener('change', SpotifyApi.clearSearch);










//gerando o form antes de adicionar a img


document.addEventListener('DOMContentLoaded', () => {
  console.log("passou aqui"); // Verifica se o script é carregado corretamente

  const openPopupBtn = document.getElementById('openPopupBtn');
  const popupForm = document.getElementById('popupForm');
  const closePopupBtn = document.getElementById('closePopupBtn');

  if (openPopupBtn) {
    openPopupBtn.addEventListener('click', () => {
      popupForm.style.display = 'block';
    });
  } else {
    console.error("Botão de abrir popup não encontrado.");
  }

  if (closePopupBtn) {
    closePopupBtn.addEventListener('click', () => {
      popupForm.style.display = 'none';
      SpotifyApi.clearFormFields();
    });
  } else {
    console.error("Botão de fechar popup não encontrado.");
  }

  window.addEventListener('click', (event) => {
    if (event.target === popupForm) {
      popupForm.style.display = 'none';
      SpotifyApi.clearFormFields();
    }
  });

  const playlistForm = document.getElementById('playlistForm');
  if (playlistForm) {
    playlistForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      await SpotifyApi.createPlaylist();
      await SpotifyApi.clearFormFields();

      // Fechar o popup após o envio do formulário
      popupForm.style.display = 'none';
    });
  } else {
    console.error("Formulário de playlist não encontrado.");
  }
});