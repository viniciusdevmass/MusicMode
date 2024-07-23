var tokenExpirado = false;
let tokenResponse = {};

let Authorization = btoa("b52591c2c6d84beeba2a0499d67d462f:0b232c033ad74407a940a13dabdd5dba")
const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
myHeaders.append("Authorization", `Basic ${Authorization}`);

//selecionados para a geração da playlist
var seedArtist = [];

var userData = {
  
};


//Lista retornada do getRecommendations
var trackDetails = [];


export default class SpotifyApi {
    static async getToken(code) {
        /*
        if(code === null){
            throw new Error ()
        }
        */

        const urlencoded = {
            code: code,
            redirect_uri: "http://127.0.0.1:5502/src/playlists.html",
            grant_type: "authorization_code"
          }

       
       
        const requestOptions = {
            method: "POST",
            body: new URLSearchParams(Object.entries(urlencoded)).toString(),
            headers: myHeaders
            
          };

          

        fetch("https://accounts.spotify.com/api/token", requestOptions)
        .then((response) =>  response.json())
        .then((result) => {
            tokenResponse = result;
            localStorage.setItem("refresh", tokenResponse.refresh_token);
            

            SpotifyApi.getUser()
            SpotifyApi.refreshToken()
            tokenExpirado = false

            setTimeout(() => {
            tokenExpirado = true
            },tokenResponse.expires_in)

        })
        .catch((error) => console.error(error));

    } 

    static async getUser() {
        
        
          if (tokenExpirado){SpotifyApi.refreshToken()}
      
      
          let url = 'https://api.spotify.com/v1/me';
          let requestUser = {
            method: 'GET', 
            headers: {
              'Content-Type': 'application/json',
              Authorization: (`Bearer ${tokenResponse.access_token}`)
        
            },
          };
      
          try {
            const response = await fetch(url, requestUser);
            if (!response.ok) {
              window.location.href = "./index.html";
              throw new Error(`Erro na requisição: ${response.statusText}`);
            }
            const data = await response.json();

            userData = {
              nome: data.display_name,
              id: data.id
            }
            document.getElementById('resultado').textContent = (`Olá! ${userData.nome}`);
           
          } catch (error) {
      
            console.error('Erro ao fazer a requisição:', error);
          }

         
        
    }
    
    
    static async refreshToken() {
        const bodyParam = {
         grant_type: "refresh_token",
         refresh_token:localStorage.getItem("refresh")
     
         }


         const requestRefresh = {
            method: "POST",
            body: new URLSearchParams(Object.entries(bodyParam)).toString(),
            headers: myHeaders
        }

        fetch("https://accounts.spotify.com/api/token", requestRefresh)
        .then((response) =>  response.json())
        .then((result) =>  tokenResponse.access_token = result.access_token)
        .catch((error) => {
          console.error(error);
          window.location.href = "./index.html";
    });
        tokenExpirado = false

        setTimeout(() => {
        tokenExpirado = true
        },tokenResponse.expires_in)

    }

    static async searchSpotify(){
        if (tokenExpirado){SpotifyApi.refreshToken()}

        

        const Search = document.getElementById('query').value;
        const type = document.getElementById('type').value;
        const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(Search)}&type=${type}&limit=5`;

         const headers = {
        'Authorization': `Bearer ${tokenResponse.access_token}`
    };

    try {
        const response = await fetch(url, { headers });
        if (response.ok) {
            const data = await response.json();
            SpotifyApi.displayResults(data);
            
        } else {
            const errorData = await response.json();
            console.error('Error:', errorData);
        }
    } catch (error) {
        console.error('Error:', error);
    }
    }

    static async displayResults(data) {
        const resultsDiv = document.getElementById('resultsSearch');
        resultsDiv.innerHTML = ''; // Limpando resultados anteriores
        let i = 1;
        var Search = document.getElementById('query')
        const searchSelect = document.getElementById('searchSelect');
       

        if (data.artists) {
            data.artists.items.forEach(artist => {
                const div = document.createElement('div');
                div.textContent = `${artist.name}`;
                resultsDiv.appendChild(div);
    
                div.id = (artist.id)
                div.classList.add('styleDiv');
                
               //adicionando a imgem do artista
               const img = document.createElement('img');
               img.src = artist.images[0].url
               img.alt = artist.name;
               img.style.width = '50px'; 
               img.style.height = '50px'; 
               div.appendChild(img);
    
               
    
    
    
                //adicionando itens a lista
                div.addEventListener('click', async () => {
                  const info = {
                    seed: div.id,
                    name: div.textContent,
                    type: 'artist'
                  }

                  const result = await SpotifyApi.canAddFilter(seedArtist, info);
                  if (!result.canAdd) {
                      alert(result.message);
                      await SpotifyApi.clearSearch()
                      return;
                  }

    
                  seedArtist.push(info)
                  SpotifyApi.clearSearch()
                  
                  //cria uma div para por os elementos selecionados na tela
                  const div1 = document.createElement('div');
                  searchSelect.appendChild(div1);
                  const div2 = document.createElement('div');
                  div2.textContent = `${div.textContent}`;
                  div1.appendChild(div2);

                  //removendo item da lista
                  div2.addEventListener('click', () => {
                    div1.removeChild(div2);
                    searchSelect.removeChild(div1);

                    const index = seedArtist.findIndex(item => item.seed === info.seed);
                    if (index !== -1) {
                        seedArtist.splice(index, 1);
                    }
                  })
                    
    
                });
                
            });
        }
        if (data.tracks) {
            data.tracks.items.forEach(track => {
                const div = document.createElement('div');
                div.textContent = `${track.name} - ${track.artists.map(artist => artist.name).join(', ')}`;
                resultsDiv.appendChild(div);
    
                div.id = (track.id)
                div.classList.add('styleDiv');
    
                const img = document.createElement('img');
                img.src = track.album.images[0].url
                img.alt = track.name;
                img.style.width = '50px'; 
                img.style.height = '50px'; 
                div.appendChild(img);
                
    
                div.addEventListener('click', async () => {
                  const info = {
                    seed: div.id,
                    name: div.textContent,
                    type: 'track'
                  }
                  
                  const result = await SpotifyApi.canAddFilter(seedArtist, info);
                  if (!result.canAdd) {
                      alert(result.message);
                      await SpotifyApi.clearSearch()
                      return;
                  }

                  seedArtist.push(info)
                  SpotifyApi.clearSearch()
                  
                  //cria uma div para por os elementos selecionados na tela
                  const div1 = document.createElement('div');
                  searchSelect.appendChild(div1);
                  const div2 = document.createElement('div');
                  div2.textContent = `${div.textContent}`;
                  div1.appendChild(div2);

                  div2.addEventListener('click', () => {
                    div1.removeChild(div2);
                    searchSelect.removeChild(div1)

                    const index = seedArtist.findIndex(item => item.seed === info.seed);
                    if (index !== -1) {
                        seedArtist.splice(index, 1);
                    }
                  })
                  
    
                });
            });
        }
    
        tokenExpirado = false
    
        setTimeout(() => {
          tokenExpirado = true
        },tokenResponse.expires_in)
    }
    
    static async clearSearch() {
        document.getElementById('resultsSearch').innerHTML = ''
        document.getElementById('query').value = ''
      
    }
      

    static async getRecommendations() {
        var artist = ('seed_artists=');
        var track = ('seed_tracks=');

        if (tokenExpirado){SpotifyApi.refreshToken()}
        SpotifyApi.clearSearch() 
      


        const headers = {
            'Authorization': `Bearer ${tokenResponse.access_token}`
          };

          const requestOptions = {
            method: 'GET',
            headers: headers
          };

        if (seedArtist.length === 0) {
            console.log("Filtros vazios")
        }else{
            seedArtist.forEach(element => { 
                if (element.type === 'artist') {artist += (`${element.seed},`) }
                else if (element.type === 'track'){track += (`${element.seed},`)}
                else{console.log("Erro")}
                
            });
        }
        
          

        const url = `https://api.spotify.com/v1/recommendations?${artist}&${track}`;
        try {
          const response = await fetch(url, requestOptions);
          if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
          }
          const data = await response.json();
          return data.tracks;
        } catch (error) {
          console.error("Erro ao obter recomendações:", error);
          window.location.href = "./index.html";  // Redireciona o usuário para index.html em caso de erro
          return [];  // Retorna um array vazio em caso de erro
        }

    }

    static async saveRecommendations2() {
      if (seedArtist.length === 0) {
        window.alert("Você precisa selecionar pelo menos 1 filtro para gerar a playlist");
        return;
      }
      const tracks = await SpotifyApi.getRecommendations();
      trackDetails.splice(0, trackDetails.length); // limpando o array antes de utilizar

      const opmod = document.getElementById('openPopupBtn')
      opmod.classList.remove('hidden2');

      const listResults2 = document.getElementById("results2")
      listResults2.classList.remove('hidden2');
      for(var x=1; x<21; x++){
        var lista = document.getElementById(`tr${x}`)
        lista.classList.remove('hidden2');       
      }
      
      tracks.forEach((track, index) => {
        const trackInfo = {
            id: track.id,
            uri: track.uri,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            release_date: track.album.release_date,
            image: track.album.images[0].url,  // Pega a primeira imagem do álbum
            seed_artist: track.artists[0].name
        };
        
        trackDetails.push(trackInfo);
        localStorage.setItem(`track_${index}`, JSON.stringify(trackInfo));
      })

      
      var i = 0;
      trackDetails.forEach((track, index) => {
        
        i++;
        const tr = document.getElementById(`tr${i}`)
        const music = document.getElementById(`ptr${i}`)
        music.innerHTML = track.name;

        const img = document.getElementById(`img${i}`)
        img.src = track.image;
        img.alt = track.artist;

        const artist = document.getElementById(`art${i}`)
        artist.innerHTML = track.artist;

        const album = document.getElementById(`alb${i}`)
        album.innerHTML = track.album;

        const btn = document.getElementById(i)
        const teste111 = btn.id;
        const parentDiv = btn.parentElement;
        parentDiv.id = track.id
        
        const deleteBtn = document.getElementById(i)
        deleteBtn.onclick = function(event){
          SpotifyApi.deleteRow(teste111)
         };



         
        /*
        const tr = document.createElement('tr');
        tr.classList.add('text-gray-700', 'dark:text-gray-400');
        tr.id = track.id;

        const td1 = document.createElement('td');
        td1.classList.add('px-4', 'py-3');

        const div1 = document.createElement('div');
        div1.classList.add('flex', 'items-center', 'text-sm');

        const div2 = document.createElement('div');
        div2.classList.add('relative', 'hidden', 'w-8', 'h-8', 'mr-3', 'rounded-full', 'md:block');

        const img = document.createElement('img');
        img.classList.add('object-cover', 'w-full', 'h-full', 'rounded-full');
        img.src = track.image;
        img.alt = track.artist;
        img.loading = 'lazy';

        const div3 = document.createElement('div');
        div3.classList.add('absolute', 'inset-0', 'rounded-full', 'shadow-inner');
        div3.setAttribute('aria-hidden', 'true');

        const div4 = document.createElement('div');
        const p = document.createElement('p');
        p.classList.add('font-semibold');
        p.textContent = track.name;

        const td2 = document.createElement('td');
        td2.classList.add('px-4', 'py-3', 'text-sm');
        td2.textContent = track.artist;

        const td3 = document.createElement('td');
        td3.classList.add('px-4', 'py-3', 'text-sm');
        td3.textContent = track.album.name;

        const div5 = document.createElement('div');
        div5.classList.add('flex', 'items-center', 'space-x-4', 'text-sm');

        const button = document.createElement('button');
        button.id = 'deleteItemList';
        button.classList.add('flex', 'items-center', 'justify-between', 'px-2', 'py-2', 'text-sm', 'font-medium', 'leading-5', 'text-purple-600', 'rounded-lg', 'dark:text-gray-400', 'focus:outline-none', 'focus:shadow-outline-gray');
        button.setAttribute('aria-label', 'Delete');

        const icon = document.createElement('i');
        icon.classList.add('fas', 'fa-trash-alt');

        button.appendChild(icon);
        div5.appendChild(button);
        div4.appendChild(p);
        div2.appendChild(img);
        div2.appendChild(div3);
        div1.appendChild(div2);
        div1.appendChild(div4);
        td1.appendChild(div1);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        
        resultsGet.appendChild(tr);
        */
      });//fecha foreach
      
    }
    static async saveRecommendations() {
        const tracks = await SpotifyApi.getRecommendations();
        trackDetails.splice(0, trackDetails.length); // limpando o array antes de utilizar
        const resultsGet = document.getElementById('results');
        resultsGet.innerHTML = ""

        tracks.forEach((track, index) => {
            const trackInfo = {
                id: track.id,
                uri: track.uri,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                release_date: track.album.release_date,
                image: track.album.images[0].url,  // Pega a primeira imagem do álbum
                seed_artist: track.artists[0].name
            };
            
            trackDetails.push(trackInfo);
            localStorage.setItem(`track_${index}`, JSON.stringify(trackInfo));
          })
        
          trackDetails.forEach((track, index) => {

      
            
            const divGet = document.createElement('div');
            divGet.textContent = `Track: ${track.name} by ${track.artist}`;
            divGet.id = track.id;
      
            const img = document.createElement('img');
                 img.src = track.image;
                 img.alt = track.artist;
                 img.style.width = '50px'; 
                 img.style.height = '50px'; 
      
            const deleteBtn = document.createElement('button')
                 deleteBtn.textContent = 'X'
                 deleteBtn.id = 'btnRemove'
                 deleteBtn.onclick = function(event){
                  SpotifyApi.deleteItemList(event)
                 };

            resultsGet.appendChild(divGet);
            divGet.appendChild(img);
            divGet.appendChild(deleteBtn);
      
        });
    }

    static async canAddFilter(seedArtist, info) {
        // Verificar se o comprimento de seedArtist não é maior do que 5
        if (seedArtist.length >= 5) {
            return { canAdd: false, message: "Você não pode adicionar mais de 5 filtros." };
        }
    
        // Verificar se o seed já existe em seedArtist
        const exists = seedArtist.some(item => item.seed === info.seed);
        if (exists) {
            return { canAdd: false, message: "Este filtro já foi adicionado." };
        }
    
        return { canAdd: true, message: "" };
    }
    
    static async createPlaylist() {
      var body = {
        name: document.getElementById('playlistName').value,
        description: document.getElementById('playlistDescription').value,
        public: false
      }
    
      let request = {
        method: 'POST', 
        headers: {
           Authorization: (`Bearer ${tokenResponse.access_token}`),
          'Content-Type': 'application/json'    
        },
        body: JSON.stringify(body)
      };
      try {
        const response = await fetch(`https://api.spotify.com/v1/users/${userData.id}/playlists`, request)
      
        if (!response.ok) {
          throw new Error(`Erro: ${response.statusText}`);
        }

        const data = await response.json();
        await SpotifyApi.uploadPlaylistImage(data.id)
        await SpotifyApi.addItemsPlaylist(data.id)
        

        return data;
      } catch (error) {
          console.error("Erro ao criar a playlist:", error);
        }
    
    }

   static async clearFormFields() {
    document.getElementById('playlistName').value = '';
    document.getElementById('playlistDescription').value = '';
    document.getElementById('playlistImage').value = '';
   }

  

   static async uploadPlaylistImage(playlist_id) {
    if (!playlist_id) {
      throw new Error('O parâmetro "id" é obrigatório.');
    }
  
    // Supondo que você tenha uma função para atualizar o token, e que esta função retorne uma Promise
    await SpotifyApi.refreshToken();
  
    const playlistImage = document.getElementById('playlistImage').files[0];
    if (!playlistImage) {
      throw new Error('Nenhuma imagem selecionada.');
    }
    const reader = new FileReader();
    
    reader.onloadend = async () => {
      const base64Image = reader.result.split(',')[1]; // Remove o prefixo "data:image/jpeg;base64,"
      
      const request = {
        method: "PUT",
        headers: {
          'Content-Type': 'image/jpeg',
          'Authorization': `Bearer ${tokenResponse.access_token}`      
        },
        body: base64Image
      };
  
      try {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/images`, request);
  
        if (!response.ok) {
          throw new Error(`Erro ao fazer o upload da imagem: ${response.statusText}`);
        }
  
      } catch (error) {
        console.error('Erro ao fazer o upload da imagem:', error);
      }
    };
  
    reader.readAsDataURL(playlistImage);
  }


  static async addItemsPlaylist(playlist_id) {
    const listUris = []
    trackDetails.forEach((track, index) => {
      listUris.push(track.uri)
    })

    const request = {
      method: 'POST',
      headers: {
        Authorization: (`Bearer ${tokenResponse.access_token}`),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uris: listUris })
    };

    try {
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, request);
      
      if (!response.ok) {
        throw new Error(`Erro: ${response.statusText}`);
      }
  
      const data = await response.json();
  
      return data;
    } catch (error) {
      console.error("Erro ao adicionar itens à playlist:", error);
    }
  }


  static async deleteRow(event){
    var index = event - 1;
    var tr = document.getElementById(`tr${event}`)

    
    var ptr = document.getElementById(`ptr${event}`)
  
    
    const remove = trackDetails.filter(track => track.name === ptr.innerHTML);


    if (remove !== -1) {
      trackDetails.splice(remove, 1);
      console.log('Lista atualizada:', trackDetails);
      tr.classList.add('hidden2');  
      
    } else {
      console.log(`Não foi possivel remover o item da lista`);
    }


  }

  







  static async deleteItemList(event){
    const button = event.target;
    const index = button - 1;
    // parentElement é o elemento pai do botão
    const parentDiv = button.parentElement;
    // Obtém o ID do elemento pai
    const trackId = parentDiv.id;

    const line = (`tr${button.id}`)




    
        

  }

}

