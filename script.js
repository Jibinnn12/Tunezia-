
play.className="fa-solid fa-pause playbarbtns"

let currentSong = new Audio(); 
let songs;
let currFolder;


function convertSecondsToMinutes(seconds) {

    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    // Convert seconds to an integer, discarding milliseconds
    seconds = Math.floor(seconds);

    // Calculate minutes
    let minutes = Math.floor(seconds / 60);
    
    // Calculate remaining seconds
    let remainingSeconds = seconds % 60;
    
    // Pad the minutes and seconds with leading zeros if necessary
    let formattedMinutes = String(minutes).padStart(2, '0');
    let formattedSeconds = String(remainingSeconds).padStart(2, '0');
    
    // Return the formatted time
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder){  
    currFolder=folder;

    let a = await fetch(`/songs/${folder}/`)  
    let response = await a.text();
    
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
      
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${currFolder}/`)[1]) 
            
            
        } 
        
    }
    
    // Fetch the album's metadata from info.json
    let albumInfo = await fetch(`/songs/${folder}/info.json`);
    let albumData = await albumInfo.json();

    let albumName = document.querySelector(".songlist").getElementsByTagName("h4")[0];
    albumName.innerHTML = albumData.title;  // Use the title from info.json 

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML=""
    for (const song of songs) {

        songUL.innerHTML = songUL.innerHTML+`  <li>  
                    
                    
                    <i class="fa-solid fa-music"></i> 
                    <div class="info">
                        <div>  ${song.replaceAll("%20"," ").replace(".mp3", "")}  </div>
                        <div>${albumData.title}</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                         </div>
                      <div class="playbt">
                      <i class="fa-solid fa-play"></i>
                      </div> 
                    

                   
        
        </li>  `; 
        
    }

    //Attaching event listeners to each songs 

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e=>{
       e.addEventListener("click",element=>{
        console.log(e.querySelector(".info").firstElementChild.innerHTML) 
        playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim()) 
       })
      
       
    })

    return songs 

}
const playMusic = (track)=>{
    currentSong.src = `/${currFolder}/` + track + ".mp3";  // Add .mp3 extension
    currentSong.play();
    play.className="fa-solid fa-pause playbarbtns"
    document.querySelector(".songinfo").innerHTML= decodeURI(track) 
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}


//function for dynamic albums

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    Array.from(anchors).forEach(async (e) => {
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/songs/").slice(-1)[0];


            
            // Fetch metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response.title);

            
            
            cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card"> 
                <div class="play bg-black">
                    <i class="fa-solid fa-play"></i>
                </div>
                <img src="/songs/${encodeURIComponent(folder)}/cover.jpg" alt="Cover for ${response.title}">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`;
        }
    });

    // Delegate click events for dynamically added cards
    document.querySelector(".cardContainer").addEventListener("click", async (event) => {
        const card = event.target.closest(".card"); // Ensure the click is on a card
        if (card) {
            const folder = card.dataset.folder; // Get the folder name
            
            songs = await getSongs(`songs/${folder}`); // Load songs for the clicked album
        }
    });
}
  


  
async function mainn(){

    
    
     await getSongs("songs/lana") 


    // Display albums dynamically 

    displayAlbums()

    
   

    play.addEventListener("click",()=>{  
        if(currentSong.paused){
            currentSong.play()
            play.className="fa-solid fa-pause playbarbtns"
            
            
           
            
            


        }
        else{
            currentSong.pause()
            play.className="fa-solid fa-play playbarbtns"
            

            
           
            
            
        }
    })
    
     currentSong.addEventListener("timeupdate", ()=>{
        totaltime=convertSecondsToMinutes(currentSong.duration) 
        time=convertSecondsToMinutes(currentSong.currentTime)

    
    document.querySelector(".songtime").innerHTML = `${time} / ${totaltime}`

    document.querySelector(".move").style.width = (currentSong.currentTime
        /currentSong.duration)*100 + "%";
})

// event listner for seekbar

document.querySelector(".seekbar").addEventListener("click", a=>{
    let percent =(a.offsetX/a.target.getBoundingClientRect().width)*100 
    document.querySelector(".move").style.width = 
    percent + "%"
    currentSong.currentTime=((currentSong.duration)*percent)/100
    
}) 
previous.addEventListener("click", ()=>{
    console.log("Previous clicked ");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
   
    
    if((index-1)>= 0){
        playMusic(songs[index-1])
    }


})
next.addEventListener("click", ()=>{
    console.log("next clicked ");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
   
    
    if((index+1) < (songs.length)){
        playMusic(songs[index+1])
    }
    

})

//

document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
    volume=e.target.value
    currentSong.volume=parseInt(volume)/100 
})

//to mute the track

document.querySelector(".volume>i").addEventListener("click", e => {
    if (e.target.classList.contains("fa-volume-low")) {
        e.target.classList.replace("fa-volume-low", "fa-volume-xmark");
        currentSong.volume=0;
        document.querySelector(".range").getElementsByTagName("input")[0].value=0
    } 
    else if (e.target.classList.contains("fa-volume-xmark")) {
        e.target.classList.replace("fa-volume-xmark", "fa-volume-low");
        currentSong.volume=.10;
        document.querySelector(".range").getElementsByTagName("input")[0].value=10
    }
});

console.log(album)
console.log("ho")
    
}   
mainn()    
