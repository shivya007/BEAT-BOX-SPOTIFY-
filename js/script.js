let currentsong = new Audio();
const play = document.querySelector("#playid");
let songs;
let currFolder;


function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}



async function getSongs(folder){
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let ul = div.querySelector("#files");
        if (ul) {
                let aTags = ul.getElementsByTagName("a");
                let aTagsArray = [...aTags];
                songs = [];
                for(let idx =0; idx < aTagsArray.length; idx++){
                    const element = aTagsArray[idx];
                    if(element.href.endsWith(".mp3")){
                        songs.push(element.href.split(`/${folder}/`)[1]);
                    }
                }



                 // show all the songs in the playlist
                let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
                songUL.innerHTML = "";
                for(const song of songs){
                    songUL.innerHTML = songUL.innerHTML + `<li>
                           <img class="invert" src="img/music.svg" alt="">
                           <div class="info">
                               <div>${song.replaceAll("%20", " ")}</div>
                               <div></div>
                           </div>
                           <div class="playnow">
                               <span>Play Now</span>
                               <img class="invert" src="img/play.svg" alt="">
                           </div></li>`;
                }
                 // Attach event listener to each song
                 Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e =>{
                    e.addEventListener("click", element=>{
                    playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());  
                    });
                });
                console.log(songs);
                return songs;
        }
        
}






async function displayAlbums(){
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let anchorsarray = Array.from(anchors);
    let cardContainer = document.querySelector(".cardContainer");

    
    for(let idx = 0; idx < anchorsarray.length; idx++){
        const e = anchorsarray[idx];
       
        if(e.href.includes("/songs") && !e.href.includes(".htaccess")){
           let parts = e.href.split("/").filter(part => part.length > 0);
            if (parts.length > 3) {  // Adjust this condition as needed
                let folder = parts.slice(-1)[0];
            

            // get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json(); 
            
            cardContainer.insertAdjacentHTML('beforeend',`<div data-folder="${folder}" class="cards">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000"stroke-width="1.5" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`);
        }
    }  
}
    // load the playlist whenever card is clicked

    Array.from(document.getElementsByClassName("cards")).forEach(e=>{
        e.addEventListener("click", async item=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
};


async function main(){
    // Get list of all songs
    let list = await getSongs("songs/ncs");
    console.log(list);


    //display all the albums on the page
    await displayAlbums();
    playMusic(songs[0], true);




    
    play.addEventListener("click", ()=>{
        if(currentsong.paused){
            currentsong.play();
            play.src = "img/pause.svg";
        }
        else{
            currentsong.pause();
            play.src = "img/play.svg";
        }
    })

    // Listen for timeupdate event
    currentsong.addEventListener("timeupdate", ()=>{
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime/ currentsong.duration) * 100 + "%";

    });

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;
    });



    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0";
    });


    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-120%";
    });


    // Add an event Listener for previous button
    document.querySelector("#previousid").addEventListener("click", ()=>{
        let idx = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if((idx - 1) >= 0){
            playMusic(songs[idx - 1]);
        }
    });
    // Add an event Listener for next button
    document.querySelector("#nextid").addEventListener("click", ()=>{
        currentsong.pause();
        console.log("Next clicked");
        let idx = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if((idx + 1) < songs.length){
            playMusic(songs[idx + 1]);
        }
        else{
            play.src = "img/play.svg";
        }
    });


    // Add an event listener for volume button
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", (e) =>{
        console.log(`Setting volume to ${e.target.value} /100`);
        currentsong.volume = parseInt(e.target.value)/100; 
        if (currentsong.volume >0){
            document.querySelector(".volumeclass>img").src = document.querySelector(".volumeclass>img").src.replace("mute.svg", "volume.svg")
        }
    });



    // Add an event listener for mute button
    document.querySelector(".volumeclass> img").addEventListener("click", e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentsong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });

    





    
}







const playMusic = (track, pause = false) =>{
    //let audio = new Audio("/songs/" + track);  // this line extract the complete URL of the audio
    currentsong.src = `/${currFolder}/` + track;
    if(!pause){
        currentsong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}
main();
