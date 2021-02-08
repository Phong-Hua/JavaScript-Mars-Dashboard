

let store = Immutable.Map ({
    user: Immutable.Map({ name: "Student" }),
    roverInfo: Immutable.Map({}),
    photos: Immutable.List([]),
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
})

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = store.merge(newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state, Greeting, RoverComponent, RoverInfo, LatestImage);
}


// create content
// Higher-order function
const App = (state, Greeting, RoverComponent, RoverInfo, LatestImage) => {
    const rovers = state.get('rovers');
    const username = state.getIn(['user', 'name']);
    const roverInfo = state.get('roverInfo');
    const photos = state.get('photos');

    return `
        <header></header>
        <main>
            ${Greeting(username)}
            <section>
                ${RoverComponent(rovers, handleRoverChange)}
            </section>
            <section>
                ${RoverInfo(roverInfo)}
            </section>
            <section>
                ${LatestImage(photos)}
            </section>
        </main>
        <footer></footer>
    `
}


/**
 * Higher order function take handleRoverChange as an argument.
 * Also, this is pure function.
 * @param {*} rover 
 */
const RoverComponent = (rovers, handleRoverChange) => {
    return `
        <label>Choose a rover</label>
        <select name="rovers" id="rovers" style="width: 200px; height: 30px;" onChange="(${handleRoverChange})(this.value)">
            <option value="none" selected disabled hidden> 
                Select an Option 
            </option> 
            ${rovers.map(rover => `<option value=${rover}>${rover}</option>`)}
        </select>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }
    return `
        <h1>Hello!</h1>
    `
}

/**
 * Pure function that renders conditional rover information.
 * @param {*} immutableRover 
 */
const RoverInfo = (immutableRover) => {

    if (immutableRover.isEmpty())
        return '';
    return `
        <h3>Rover Information</h3>
        <ul>
            <li>Name: ${immutableRover.get('name')}</li>
            <li>Launch Date: ${immutableRover.get('launchDate')}</li>
            <li>Landing Date: ${immutableRover.get('landingDate')}</li>
            <li>Max Date: ${immutableRover.get('maxDate')}</li>            
            <li>Status: ${immutableRover.get('status')}</li>
            <li>Total Photos: ${immutableRover.get('totalPhotos')}</li>
        </ul>
    `
}

/**
 * Pure function that render conditional photos. 
 * Higher order function.
 * @param {*} immutablePhotos 
 */
const LatestImage = (immutablePhotos) => {
    if (immutablePhotos.isEmpty())
        return '';
    const photos = immutablePhotos.map(photo => `<img src=${photo} style="margin:10px;" />`);
    return ((photos) => {
        return `
            <h3>Latest Image</h3>
            ${photos.join('')}
        `
    })(photos);
}


const handleRoverChange = (rover) => {
    return loadData (store, rover);
}

const loadData = async (store, name) => {
    const roverInfo = await getRoverInfo(name);
    const photos = await loadImage(roverInfo.name, roverInfo.maxDate);

    updateStore(store, {rover: name, roverInfo, photos})
}

// ------------------------------------------------------  API CALLS

/**
 * Higher order function
 * @param {*} rover 
 * @param {*} earthdate 
 */
const loadImage = (rover, earthdate) => {
    return fetch(`http://localhost:3000/latest_photos/${rover}/${earthdate}`)
    .then(res => res.json())
    .then(data => convertImageData(data))
}

const convertImageData = ({photos}) => {
    if (photos)
        return photos.map(photo => photo.img_src);
    return []
}

/**
 * Higher order function
 * @param {*} name 
 */
const getRoverInfo = (name) => {
    return fetch(`http://localhost:3000/rovers/${name}`)
    .then(res => res.json())
    .then(data => convertRoverData(data))
}

const convertRoverData = (data) => {
    const photoManifest = data.photo_manifest;
    const rover = {
        'name' : photoManifest.name,
        'landingDate': photoManifest.landing_date,
        'launchDate': photoManifest.launch_date,
        'maxDate': photoManifest.max_date,
        'status': photoManifest.status,
        'totalPhotos': photoManifest.total_photos,
    }
    return rover;
}
