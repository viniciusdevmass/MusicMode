let jsonData = [];
const fileListElement = document.getElementById('fileList');

document.getElementById('fileInput').addEventListener('change', function(event) {
    const files = event.target.files;
    for (const file of files) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                jsonData = jsonData.concat(data);
                const fileItem = document.createElement('div');
                fileItem.textContent = `Arquivo: ${file.name}, Tamanho: ${file.size} bytes`;
                fileListElement.appendChild(fileItem);
            } catch (error) {
                console.error('Erro ao analisar o JSON:', error);
            }
        };
        reader.readAsText(file);
    }
});

document.getElementById('processButton').addEventListener('click', function() {
    if (jsonData.length > 0) {
        initializeFilters(jsonData);
        updateDisplay();
    } else {
        alert('Nenhum arquivo carregado.');
    }
});

function initializeFilters(data) {
    const artistSelect = document.getElementById('artistSelect');
    const artists = [...new Set(data.map(item => item.artistName))];
    artistSelect.innerHTML = '<option value="">Todos</option>';
    artists.forEach(artist => {
        artistSelect.innerHTML += `<option value="${artist}">${artist}</option>`;
    });

    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const monthSelect = document.getElementById('monthSelect');
    monthSelect.innerHTML = '<option value="">Todos</option>';
    months.forEach((month, index) => {
        monthSelect.innerHTML += `<option value="${index + 1}">${month}</option>`;
    });

    const years = [...new Set(data.map(item => new Date(item.endTime).getFullYear()))];
    const yearSelect = document.getElementById('yearSelect');
    yearSelect.innerHTML = '<option value="">Todos</option>';
    years.forEach(year => {
        yearSelect.innerHTML += `<option value="${year}">${year}</option>`;
    });

    // Atualiza os dados automaticamente ao mudar os filtros
    document.getElementById('artistSelect').addEventListener('change', updateDisplay);
    document.getElementById('monthSelect').addEventListener('change', updateDisplay);
    document.getElementById('yearSelect').addEventListener('change', updateDisplay);
}

function filterData() {
    const artist = document.getElementById('artistSelect').value;
    const month = document.getElementById('monthSelect').value;
    const year = document.getElementById('yearSelect').value;

    return jsonData.filter(item => {
        const date = new Date(item.endTime);
        const matchesArtist = artist ? item.artistName === artist : true;
        const matchesMonth = month ? (date.getMonth() + 1) === parseInt(month) : true;
        const matchesYear = year ? date.getFullYear() === parseInt(year) : true;
        return matchesArtist && matchesMonth && matchesYear;
    });
}

function updateDisplay() {
    const filteredData = filterData();
    displayArtistData(filteredData);
    displayTrackData(filteredData);
    displaySummary(filteredData);
}

function displayArtistData(data) {
    const output = document.getElementById('output');
    output.innerHTML = '';

    // Agrupa os dados por artista
    const artistData = data.reduce((acc, item) => {
        const artistName = item.artistName;
        if (!acc[artistName]) {
            acc[artistName] = { count: 0, msPlayed: 0 };
        }
        acc[artistName].count += 1;
        acc[artistName].msPlayed += item.msPlayed;
        return acc;
    }, {});

    // Ordena por quantidade de músicas em ordem decrescente
    const sortedArtists = Object.keys(artistData).sort((a, b) => artistData[b].count - artistData[a].count);

    // Cabeçalho
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('artist-summary');
    headerDiv.classList.add('header');
    headerDiv.innerHTML = `
        <div>Nome do Artista</div>
        <div>Quantidade de Músicas</div>
        <div>Tempo Total Ouvindo</div>
    `;
    output.appendChild(headerDiv);

    // Adiciona cada artista à lista, com limite de 50 itens
    let itemCount = 0;
    sortedArtists.forEach(artist => {
        if (itemCount < 50) {
            const div = document.createElement('div');
            div.classList.add('artist-summary');
            div.innerHTML = `
                <div style="width: 50%;">${artist}</div>
                <div style="width: 20%;">${artistData[artist].count}</div>
                <div style="width: 30%;">${formatTime(artistData[artist].msPlayed)}</div>
            `;
            output.appendChild(div);
            itemCount++;
        }
    });
}

function displayTrackData(data) {
    const trackList = document.getElementById('trackList');
    trackList.innerHTML = '';

    // Agrupa os dados por música
    const trackData = data.reduce((acc, item) => {
        const trackName = item.trackName;
        if (!acc[trackName]) {
            acc[trackName] = { count: 0, msPlayed: 0 };
        }
        acc[trackName].count += 1;
        acc[trackName].msPlayed += item.msPlayed;
        return acc;
    }, {});

    // Ordena por quantidade de vezes tocado em ordem decrescente
    const sortedTracks = Object.keys(trackData).sort((a, b) => trackData[b].count - trackData[a].count);

    // Cabeçalho
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('track-summary');
    headerDiv.classList.add('header');
    headerDiv.innerHTML = `
        <div>Nome da Música</div>
        <div>Quantidade de Vezes Tocada</div>
        <div>Tempo Total Ouvindo</div>
    `;
    trackList.appendChild(headerDiv);

    // Adiciona cada música à lista, com limite de 50 itens
    let itemCount = 0;
    sortedTracks.forEach(track => {
        if (itemCount < 50) {
            const div = document.createElement('div');
            div.classList.add('track-summary');
            div.innerHTML = `
                <div style="width: 50%;">${track}</div>
                <div style="width: 20%;">${trackData[track].count}</div>
                <div style="width: 30%;">${formatTime(trackData[track].msPlayed)}</div>
            `;
            trackList.appendChild(div);
            itemCount++;
        }
    });
}

function displaySummary(data) {
    const summary = document.getElementById('summary');
    const totalMsPlayed = data.reduce((acc, item) => acc + item.msPlayed, 0);
    const totalMinutes = formatTime(totalMsPlayed);
    const uniqueTracks = new Set(data.map(item => item.trackName)).size;
    const uniqueArtists = new Set(data.map(item => item.artistName)).size;

    summary.innerHTML = `        
        <div>
          <p>Plays</p>
          <h3>${data.length}</h3>
        </div>

        <div>
          <p>minutos</p>
          <h3>${totalMinutes}</h3>         
        </div>

        <div>
          <p>Músicas</p>
          <h3>${uniqueTracks}</h3>      
        </div>

        <div>
          <p>Artistas</p>
          <h3>${uniqueArtists}</h3>
        </div>
    `;
}

function formatTime(ms) {
    const totalMinutes = Math.floor(ms / 60000);
    return `${totalMinutes}`;
}
