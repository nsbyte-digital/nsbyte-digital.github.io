let mode = "line" // line / pixel

let imgElement
let inputElement 
let canvasPreview

let player_ids = []

let WebSocket=window.WebSocket
let socket_id = 0

let originalSend = WebSocket.prototype.send,setTrue=false;

window.wsObj={}

async function sapaSemua() {
    for (let index = 0; index < player_ids.length; index++) {
        const player_id = player_ids[index];

        window.wsObj.send("42"+JSON.stringify([45,socket_id,[player_id,true]]))
        window.wsObj.send("42"+JSON.stringify([45,socket_id,[player_id,false]]))
        await delay(1000)
    }
}

function sendReport() {
    window.wsObj.send("42"+JSON.stringify([35,socket_id]))
    window.wsObj.close()
}

let lines = []
let rotate = false


let new_images = []
let new_centers = []

let w = 64,
    h = 64,
    clusterCount = 10; 

let w_result = 4,
    h_result = 4,
    space = 0;



async function sendImagePixel() {

    var soket = window.wsObj, 
    id_user = socket_id 


    for (let i = 0; i < new_images.length; i++) {
        const color_segment = new_images[i];
        const colors = new_centers[i]
        var color = rgbToHex(parseInt(colors[0]),parseInt(colors[1]),parseInt(colors[2]))
        
        var color_message = "42"+JSON.stringify([10,id_user,[5,color]])
        soket.send(color_message)

        await delay(100);

        // send fill format
        // [3,x1,y1,w1,h1,x2,y2,w2,h2]
        let data = [3] 

        for (let j = 0; j < color_segment.length; j++) {
            const coordinate = color_segment[j]; // X,Y
            data = [...data,...[150+coordinate[0]*(w_result+space),20+coordinate[1]*(h_result+space),w_result,h_result]]
        }

        var fill_point_message = "42"+JSON.stringify([10,id_user,data])
        soket.send(fill_point_message)

        console.log(colors)
        console.log(data)

        await delay(500);
    }

    await sendLine()

}


async function sendLine() {
    var soket = window.wsObj, 
    id_user = socket_id 

    message = "42"+JSON.stringify([10,id_user,[5, "x000000"]])
    soket.send(message)

    message = "42"+JSON.stringify([10,id_user,[6, w_result]])
    soket.send(message)

    await delay(150);

    lines = lines.sort((a, b) => b.length - a.length);

    for (let i = 0; i < lines.length; i++) {

        if (i == 100) {
            break
        }

        var result = Object.keys(lines[i]).map((key) => {
            if (key % 2 == 0) {
                return  (w_result/2) + 150 + lines[i][key] * (w_result+space)
            }
            return (w_result/2) + 20 + lines[i][key] * (w_result+space)
        });

        message = "42"+JSON.stringify([10,id_user,[2,...result]])
        soket.send(message)
        console.log(i+" dari : "+lines.length)
        await delay(250);
    }
}



const delay = (amount = number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, amount);
    });
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "x" + componentToHex(r).toUpperCase() + componentToHex(g).toUpperCase() + componentToHex(b).toUpperCase();
}

function sendColor(socket,id,color){
    var color = "42"+JSON.stringify([10,id,[5,color]])
    socket.send(color)
}


async function sendBlink(socket,id) {
    for (let index = 0; index < 8; index++) {
        if (index % 2 == 0) {
            var color = rgbToHex(0,0,255)
        }else{
            var color = rgbToHex(255,0,0)
        }
        sendColor(socket,id,color)
        var color = "42"+JSON.stringify([10,id,[3, 0, 0, 767, 448]])
        socket.send(color)
        await delay(150);
    }
}

async function sendBlack(socket,id){

        var clr = rgbToHex(117,47,27)
        sendColor(socket,id,clr)
        var color = "42"+JSON.stringify([10,id,[3, 0, 0, 767, 448]])
        socket.send(color)
        // await delay(250);
        var clr = rgbToHex(42, 117, 19)
        sendColor(socket,id,clr)
        var color = "42"+JSON.stringify([10,id,[3, 0+20, 0+20, 767-20-25, 448-20-25]])
        socket.send(color)
}

function placeToCanvas(){
    canvasPreview = document.querySelectorAll("canvas")[1]
    const ctx = canvasPreview.getContext("2d");
    ctx.lineWidth = 2;

    ctx.beginPath();

    lines = lines.sort((a, b) => b.length - a.length);
    // Start a new Path

    for (let i = 0; i < lines.length; i++) {
        var line = lines[i]
        for (let j = 0; j < line.length; j+=2) {
            if (j==0) {
                ctx.moveTo(200+line[j], 80+line[j+1]);
            }else{
                ctx.lineTo(200+line[j], 80+line[j+1]);
            }
        }
        ctx.stroke();
    }

}

async function sendImageLine(){
    var soket = window.wsObj, 
        id_user = socket_id 

    message = "42"+JSON.stringify([10,id_user,[6,3]])
    soket.send(message)

    // message = "42"+JSON.stringify([10,id_user,[3,0,0,767,448]])
    // soket.send(message)
    // message = "42"+JSON.stringify([10,id_user,[5, "xAAAAAA"]])
    // soket.send(message)

    await delay(150);

    lines = lines.sort((a, b) => b.length - a.length);

    for (let i = 0; i < lines.length; i++) {
        if (i == 150) {
            break;
        }
        var result = Object.keys(lines[i]).map((key) => {
            if (key % 2 == 0) {
                return  200 + lines[i][key]
            }
            return 80+lines[i][key]
        });

        // let color = [Math.round(Math.random() * 255), Math.round(Math.random() * 255),
        //                         Math.round(Math.random() * 255)]

        // color = rgbToHex(color[0],color[1],color[2])
                                
        // sendColor(soket,id_user,color)

        message = "42"+JSON.stringify([10,id_user,[2,...result]])
        soket.send(message)
        console.log(i+" dari : "+lines.length)
        await delay(150);
    }
}

function sendImage() {
    if (mode == 'line') {
        sendImageLine()
    }else{
        sendImagePixel()
    }
}


function onloadPixel() {
    lines =[]
    new_images = []
    new_centers = []

    for (let i_new_images = 0; i_new_images < clusterCount; i_new_images++) {
        new_images.push([])
    }

    let src = cv.imread(imgElement);

    let dsize = new cv.Size(124, 124);
    cv.resize(src, src, dsize, 0, 0, cv.INTER_AREA);

    let img_gray = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
    cv.cvtColor(src, img_gray, cv.COLOR_RGBA2GRAY, 0);

    let edges = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
    cv.Canny(img_gray, edges, 180, 200, 3, false);

    let sample= new cv.Mat(src.rows * src.cols, 3, cv.CV_32F);
    for( var y = 0; y < src.rows; y++){
        for( var x = 0; x < src.cols; x++){
            for( var z = 0; z < 3; z++){
                sample.floatPtr(y + x*src.rows)[z] = src.ucharPtr(y,x)[z];
            }
        }
    }

    var labels= new cv.Mat();
    var attempts = 10;
    var centers= new cv.Mat();

    var crite= new cv.TermCriteria(cv.TermCriteria_EPS + cv.TermCriteria_MAX_ITER, 10, 1.0);
    cv.kmeans(sample, clusterCount, labels, crite, attempts, cv.KMEANS_RANDOM_CENTERS, centers);
    
    for (let i_cluster = 0; i_cluster < clusterCount; i_cluster++) {
        new_centers.push(centers.floatPtr(i_cluster))
    }
    
    var new_image = new cv.Mat(src.size(),src.type());

    let coor_x=0,coor_y=0
    var w = src.cols

    for (let index = 0; index < labels.data32S.length; index++) {
        const label = labels.data32S[index];
        const color = centers.floatPtr(label)

        new_images[label].push([coor_y,coor_x])

        const iter = coor_x*w*4 + coor_y*4
        new_image.data[iter]   = color[0]
        new_image.data[iter+1] = color[1]
        new_image.data[iter+2] = color[2]
        new_image.data[iter+3] = 255
        
        coor_x += 1
        if ((index+1) % w == 0) {
            coor_x = 0
            coor_y += 1
        }
    }

    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    cv.findContours(edges, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

    // store line points
    for (let i = 0; i < contours.size(); ++i) {
        var cntr = contours.get(i)
        lines[i] = cntr.data32S
    }

    // draw contours with random Scalar
    for (let i = 0; i < contours.size(); ++i) {
        let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
                                Math.round(Math.random() * 255));
        cv.drawContours(new_image, contours, i, [0,0,0,255], 1.5, cv.LINE_8, hierarchy, 100);
    }


    let res_size = new cv.Size(300, 300);
    cv.resize(new_image, new_image, res_size, 0, 0, cv.INTER_AREA);

    cv.imshow('canvasOutput', new_image);
    // cv.imshow('canvasOutput2', new_image);

    src.delete();
    img_gray.delete();
    edges.delete();
    // src.delete(); dst.delete(); contours.delete(); hierarchy.delete();

}


function onloadLine() {
    lines = []
    let src = cv.imread(imgElement);

    if (rotate) {
        cv.rotate(src, src, cv.ROTATE_180);
    }

    let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    cv.Canny(src, src, 150, 150, 3, false);

    let contours  = new cv.MatVector();
    let hierarchy = new cv.Mat();
    // You can try more different parameters
    cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

    // cv.drawContours(dst, contours, 50, [255,0,0,255], 1, cv.LINE_8, hierarchy, 100);
    console.log(contours.size())
    // console.log(contours.get(50).data32S)
    for (let i = 0; i < contours.size(); ++i) {
        var cntr = contours.get(i)
        lines[i] = cntr.data32S
    }
    console.log(lines)
    // draw contours with random Scalar
    for (let i = 0; i < contours.size(); ++i) {
        let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
                                Math.round(Math.random() * 255));
        cv.drawContours(dst, contours, i, color, 1, cv.LINE_8, hierarchy, 100);
    }

    cv.imshow('canvasOutput', dst);
    src.delete(); dst.delete(); contours.delete(); hierarchy.delete();

    placeToCanvas()
}

function imageOnload() {
    if (mode == "pixel") {
        onloadPixel()
    }else{
        onloadLine()        
    }
}

(function () {

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://docs.opencv.org/4.5.0/opencv.js';
    document.head.appendChild(script);

    document.querySelector(".area.fixed").innerHTML += '<div><button id="btnSendImage" style="padding:10px;background-color:#0f0;margin: 10px;">Send Image🚀</button><br><button id="btnReport" style="padding:10px;margin: 10px;background-color:#0f0;">Report❗</button><br><button id="btnSapaSemua" style="padding:10px;color: #000000;background-color: #36e5f9;font-weight: bold;margin: 10px;">Sapa Semua 😇</button><div class="inputoutput" style="display: block;"><img id="imageSrc" width="300px"  alt="No Image" /><div class="caption">imageSrc <input type="file" id="fileInput" name="file" /></div></div><div class="inputoutput"><canvas id="canvasOutput"></canvas><div class="caption">canvasOutput</div></div></div>'


    document.getElementById("btnReport").onclick = function () {
        sendReport()
    }
    
    document.getElementById("btnSendImage").onclick = function () {
        sendImage()
    }
    
    document.getElementById("btnSapaSemua").onclick = function () {
        sapaSemua()
    }

    imgElement = document.getElementById('imageSrc');
    inputElement = document.getElementById('fileInput');
    canvasPreview = document.querySelectorAll("canvas")[1]

    console.log("running")

    WebSocket.prototype.send=function(data){
        originalSend.apply(this, arguments)

        if (data.indexOf('42[46')!=-1) {
            var dt = JSON.parse(data.substring(2))
            socket_id = dt[1]
        }

        if(Object.keys(window.wsObj).length==0){
            window.wsObj=this
            window.wsObj.addEventListener("message",(msg)=>{
                if(msg.data.indexOf('42["5"')!=-1){
                    var dt = JSON.parse(msg.data.substring(2))
                    console.log(dt)
                    player_ids = []
                    dt[5].forEach(player => {
                        player_ids.push(player["id"])
                    });
                }
            })
        }
    };
        
    window.addEventListener('paste', e => {
        imgElement.src = URL.createObjectURL(e.clipboardData.files[0]);
    });

    inputElement.addEventListener('change', (e) => {
        imgElement.src = URL.createObjectURL(e.target.files[0]);
    }, false);

    imgElement.onload = imageOnload;

})()



// // usage
// var script = document.createElement('script');
// script.type = 'text/javascript';
// script.src = 'https://nsbytedigital.com/zkrbot.js';
// document.head.appendChild(script);
