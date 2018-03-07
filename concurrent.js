const ProgressBar = require('ascii-progress')
const request = require('request')
const fs = require('graceful-fs')

require('colors')

var argv = require('minimist')(process.argv.slice(2))

const idsPath = argv["i"] || "ids.txt"
const dlPath = argv["o"] || __dirname + "/dl"

const maxConcurrentDownloads = argv["max-concurrent"] || argv["c"] || 5

const useIds = argv["use-ids"] ? true : false

const ua = "e621 id downloader (https://github.com/tetra-fox/e621-id-downloader)"

let ids

var queue = new Array(maxConcurrentDownloads).fill(null)
var progressBars = new Array(maxConcurrentDownloads).fill(null).map(() => new ProgressBar({ width: 20, clear: true }))

var totalBar = new ProgressBar({
  schema: `total progress: [:bar] :current/:total, :percent complete, max ${maxConcurrentDownloads} concurrents`.cyan,
  width: 50,
  clear: true
})

var currentIndex = 0

if(argv["s"] || argv["search"]) {
  var tags = argv["s"] || argv["search"]
  var limit = argv["l"] || argv["limit"] || 10
  console.log(`searching for ${tags}`.yellow)

  // TODO save image urls for later instead of downloading
  // them again
  request("https://e621.net/post/index.json", {
    qs: {
      tags, limit
    },
    headers: {
      "User-Agent": ua
    }, json: true
  }, (err, res, body) => {
    ids = body.map(i => i.id)

    console.log(`downloading ${ids.length} files...`.yellow)
    totalBar.total = ids.length
    totalBar.tick(0)
    console.log("")
  
    // fill all spots initially
    for(var i = 0; i < maxConcurrentDownloads; i++)
      download()
  })
} else {
  if (!fs.existsSync(dlPath)) fs.mkdirSync(dlPath)
  
  if (!fs.existsSync(idsPath)) {
    console.log(`file "${idsPath}" does not exist! aborting.`)
    process.exit(1)
  }
  
  fs.readFile(idsPath, "utf8", (err, contents) => {
    ids = contents.split(",")
    console.log(`downloading ${ids.length} files...`.yellow)
    totalBar.total = ids.length
    totalBar.tick(0)
    console.log("")
  
    // fill all spots initially
    for(var i = 0; i < maxConcurrentDownloads; i++)
      download()
  })
}

var download = () => {
  // do we have a spot in the queue open?
  var openSpot = queue.indexOf(null)

  if(openSpot !== -1) {
    var id = ids[currentIndex]
    // sorry
    var thisIndex = parseInt(currentIndex)
    queue[openSpot] = id

    if(id !== undefined) {
      request(`https://e621.net/post/show.json?id=${id}`, {
        headers: {
          "User-Agent": ua
        }, json: true
      }, (err, res, body) => {
        if(!err && res.statusCode === 200 && body && body.md5) {
          var filename = body.file_url.substring(body.file_url.lastIndexOf("/") + 1)
          var fileExt = filename.split(".")[1]
          
          // var bar = new ProgressBar({
          //   width: 20,
          //   clear: true,
          //   callback: () => {
          //     bar.setSchema(`[:bar] ${useIds ? `${id}.${fileExt}` : filename} done! (${thisIndex + 1}/${ids.length})`.green, true)
          //   }
          // })

          var bar = progressBars[openSpot]

          bar.current = 0
          bar.setSchema(`[:bar] ${useIds ? `${id}.${fileExt}` : filename} :percent, :etas left (${thisIndex + 1}/${ids.length})`.cyan, true)
    
          var stream = fs.createWriteStream(`${dlPath}/${useIds ? `${id}.${fileExt}` : filename}`)

          var fileDl = request(body.file_url)
            .on("response", res => {
              bar.total = parseInt(res.headers["content-length"], 10)
  
              res.on("data", data => {
                bar.tick(data.length)
              })

              res.on("end", () => {
                // need to do this to avoid reaching OS-defined
                // hard limit for open files/connections (EMFILE)
                stream.close()
                totalBar.tick()
                queue[openSpot] = null
                download()
              })
            })
            .pipe(stream)
        } else {
          // var bar = new ProgressBar({
          //   width: 20,
          //   clear: true
          // })

          var bar = progressBars[openSpot]

          bar.setSchema(`[:bar] error! (${thisIndex + 1}/${ids.length})`.red, true)

          totalBar.tick()
          queue[openSpot] = null
          download()
        }
      })
    }

    currentIndex++
  }
}