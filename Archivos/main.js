//ELEMENTOS HTML DE LA PÁGINA
const grid = document.getElementsByClassName('grid')[0]; 
const moreDiv = document.getElementById('render-more'); //donde irá boton de mostrar mas 
const favoritesLink = document.getElementsByClassName('question-link')[0]; //boton de favoritos

// Modal 1 (ampliar imagen)
const detailModal = document.getElementsByClassName('modal')[0];
const modalImage = detailModal.getElementsByTagName('img')[0];
const modalName = detailModal.getElementsByClassName('tag')[0];
const previousButton = detailModal.getElementsByTagName('button')[0];
const nextButton = detailModal.getElementsByTagName('button')[1];
const modalCloseButton = document.getElementsByClassName('close-button')[0];

// Modal 2 (buscar favoritos)
const favoritesModal = document.getElementsByClassName('modal')[1];
const form = document.getElementsByTagName('form')[0];
const input = document.getElementsByClassName('input')[0];
const favoriteImage = favoritesModal.getElementsByTagName('img')[0];
const favoriteName = favoritesModal.getElementsByClassName('tag')[0];
const favoritesCloseButton = document.getElementsByClassName('close-button')[1];

/* Guardamos el HTML de la card que viene en el index.html y la quitamos de la página.
Después la usaremos como molde para crear una card por cada Pokémon.*/
const cardHTML = document.getElementsByClassName('card')[0].innerHTML;
document.getElementsByClassName('card')[0].remove();

// VARIABLES
let nextPageUrl = null;      // dirección de la página siguiente de la API
let previousPageUrl = null;  // dirección de la página anterior de la API
let pokemons = [];       // los 20 pokémon de la página actual
let current = null;      // pokémon que está abierto en la modal
let images = [];         // las 4 imágenes del pokémon abierto en la modal
let imageIndex = 0;      // posición de la imagen que se está viendo (0, 1, 2 o 3)

// PETICIÓN API REUTILIZABLE
const getData = async (apiLink) => {
    try {
        const response = await fetch(apiLink);
        if (response.ok) {
            const jsonResponse = await response.json();
            return jsonResponse;
        }
    } catch (error) {
        console.log(error);
    }
}

// Carga una página de la API y muestra solo los 3 primeros pokémon de los 20 que devuelve automáticamente
const loadPage = async (apiLink) => {
    const data = await getData(apiLink);
    nextPageUrl = data.next;
    previousPageUrl = data.previous;
    pokemons = data.results;
    grid.innerHTML = '';
    let firstPokemons = pokemons.filter((pokemon, index) => index < 3); //crea un array auxiliar con los 3 primeros
    firstPokemons.map(createCard); //le hace map creando cartas
    showMoreButton();
}

//CREAR CARDS
const createCard = async (pokemon) => {
    const card = document.createElement('div'); //crear elemento
    card.className = 'card';
    card.innerHTML = cardHTML; //le metemos el HTML guardado antes para el molde
    grid.appendChild(card);//lo añadimos al index

    // Pedimos los datos de ese pokémon a la API (nombre e imágenes)
    let apiDetailLink = pokemon.url;
    const detailData = await getData(apiDetailLink);

    // Rellenamos la card con el nombre y la imagen front_shiny
    card.getElementsByClassName('card-title')[0].textContent = detailData.name;
    card.getElementsByClassName('photo')[0].style.backgroundImage = `url(${detailData.sprites.front_shiny})`;

    // Al pulsar "Ampliar" se abre la modal
    card.getElementsByClassName('trigger')[0].addEventListener('click', () => openModal(detailData));
}

// MODAL CON CARRUSEL
const openModal = (detailData) => { //recibimos el detalle
    current = detailData; //lo rellenamos en la variable de fuera para que los datos esten disponibles para los metodos de favoritos tambien
    images = [current.sprites.front_default, current.sprites.back_default, current.sprites.back_shiny, current.sprites.front_shiny];
    imageIndex = 0;
    modalImage.src = images[imageIndex];
    modalName.textContent = current.name;
    detailModal.className = 'modal show-modal'; // cambia la clase para que se muestre con css 
}

const nextImage = () => {
    imageIndex = imageIndex + 1;
    if (imageIndex === 4) {
        imageIndex = 0; // después de la última, vuelve a la primera
    }
    modalImage.src = images[imageIndex];
}

nextButton.addEventListener('click', nextImage);

const previousImage = () => {
    imageIndex = imageIndex - 1;
    if (imageIndex === -1) {
        imageIndex = 3; // antes de la primera, va a la última
    }
    modalImage.src = images[imageIndex];
}

previousButton.addEventListener('click', previousImage);

// PÁGINAS Y BOTONES "MOSTRAR MÁS"
const showMoreButton = () => {
    moreDiv.innerHTML = '<button>MOSTRAR MÁS</button>'; //rellenamos el div con un boton
    moreDiv.getElementsByTagName('button')[0].addEventListener('click', showAll); //le asociamos su función
}

const showAll = () => {
    let morePokemons = pokemons.filter((pokemon, index) => index >= 3); //crea array auxiliar de los 17 siguientes saltando los tres primeros
    morePokemons.map(createCard); // le hacemos map llamando a crear cartas 

    // Quitamos el botón "Mostrar más" 
    moreDiv.innerHTML = '';
    // y ponemos los de navegación
    if (previousPageUrl !== null) { // en la primera página no hay "anteriores"
        const previousPageButton = document.createElement('button'); //crear botón
        previousPageButton.textContent = 'ANTERIORES';
        moreDiv.appendChild(previousPageButton); //añadir botón a index
        previousPageButton.addEventListener('click', () => loadPage(previousPageUrl)); //asociarlo a la función correspondiente

    }
    if (nextPageUrl !== null) { // en la última página no hay "siguientes"
        const nextPageButton = document.createElement('button'); //crear botón
        nextPageButton.textContent = 'SIGUIENTES';
        moreDiv.appendChild(nextPageButton); //añadir botón a index
        nextPageButton.addEventListener('click', () => loadPage(nextPageUrl)); //asociarlo a la función correspondiente
    }
}

modalCloseButton.addEventListener('click', () => { detailModal.className = 'modal'; }); //cambia estilo para que con css no se muestre

// FAVORITOS (localStorage)
const getFavorites = () => {
    const favoritesData = JSON.parse(window.localStorage.getItem('favorites')); //recuperamos los favoritos guardados y los convertimos de JSON a JavaScript
    if (favoritesData === null) {
        return []; // si todavía no hay nada guardado, devolvemos una lista vacía
    }
    return favoritesData; //devolvemos lo que haya
}

const addFavorite = () => {
    const favoritesData = getFavorites(); // recuperamos el array de favoritos en javascript
    favoritesData.push({ name: current.name, image: current.sprites.front_default }); //le añadimos un objeto al final
    window.localStorage.setItem('favorites', JSON.stringify(favoritesData)); //lo transformamos a json de nuevo y sobreescribimos
}

const openFavorites = () => {
    favoriteImage.src = './pokemon.jpg'; // cada vez que se abre, se ve la imagen original
    favoriteName.textContent = 'Pokémon';
    favoritesModal.className = 'modal show-modal'; //cambia la clase y muestra el modal con css 
}

const searchFavorite = (event) => {
    event.preventDefault();
    const favorites = getFavorites(); //recogemos los favoritos 
    const searchedName = input.value.toLowerCase(); //recogemos el nombre buscado quitando mayusculas si fuera necesario 
    const found = favorites.filter(pokemon => pokemon.name === searchedName); //creamos array auxiliar con lo que coincida con la busqueda
    if (found.length === 0) {
        alert('No hay ningún Pokémon guardado con el nombre introducido'); //si no encuentra
    } else {
        favoriteImage.src = found[0].image; //si encuentra rellenamos el modal
        favoriteName.textContent = found[0].name;
    }
}

modalName.addEventListener('click', addFavorite);
favoritesLink.addEventListener('click', openFavorites);
form.addEventListener('submit', searchFavorite);
favoritesCloseButton.addEventListener('click', () => { favoritesModal.className = 'modal'; }); //cambia estilo para que con css no se muestre

// LLAMAR LA PÁGINA
loadPage('https://pokeapi.co/api/v2/pokemon');