const fs = require("fs");
const request = require("request");
const colors = require("colors");
const ProgressBar = require("progress");

const idsPath = process.argv.slice(2)[0] || "ids.txt";
const dlPath = __dirname + "/dl";
const e621Api = "https://e621.net/post/show.json?id=";

// create download path if it does not exist already
if (!fs.existsSync(dlPath)) {
    fs.mkdirSync(dlPath);
}

// checks if ids file exists, otherwise abort
if (!fs.existsSync(idsPath)) {
    console.log(`file "${idsPath}" does not exist! aborting.`);
    process.abort();
}

let ids;
let total;

// read and parse ids file, start dl process
fs.readFile(idsPath, "utf8", (err, contents) => {
    ids = contents.split(",");
    total = ids.length;
    download();
});


let currentIndex = 0;
let errors = 0;

const download = () => {
    let postId = ids[currentIndex];
    request({
        url: e621Api + postId,
        headers: {
            "User-Agent": "e621 id downloader (https://github.com/tetra-fox/e621-id-downloader)"
        },
        json: true
    }, (err, res, body) => {
        console.log(`downloading post ${postId} (${currentIndex + 1}/${total})`);
        // check if md5 is available because according to the e621 api docs, the md5 key is only available on non deleted posts
        if (body.md5) {
            let filename = body.file_url.substring(body.file_url.lastIndexOf("/") + 1);
            request(body.file_url)
                .on("response", (res) => {
                    let bar = new ProgressBar(`${filename} [:bar] :percent, :etas left`.blue, {
                        complete: "█",
                        incomplete: " ",
                        width: 20,
                        total: parseInt(res.headers["content-length"], 10)
                    });

                    res.on("data", function (data) {
                        bar.tick(data.length);
                    });
                })
                .pipe(fs.createWriteStream(`${dlPath}/${filename}`))
                .on("finish", () => {
                    console.log("success!".green);
                    currentIndex++;
                    isDone();
                });
        } else {
            console.log(`error! skipping post ${postId}`.red);
            errors++;
            currentIndex++;
            isDone();
        }
    });
}

const isDone = () => {
    console.log("===================");
    if (currentIndex !== total) {
        download();
    } else {
        console.log("finished!".green);
        console.log(`successfully downloaded ${total - errors}/${total} posts`.yellow);
    }
}