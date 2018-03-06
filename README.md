# e621-id-downloader
download e621 images from a list of ids

![](https://i.imgur.com/bWWClX6.gif)

# usage
1. make sure [node.js](https://nodejs.org/) is installed
2. download/clone this repo
3. in the repo, run `node index [comma separated ids file]` (if no file is supplied, it will default to `ids.txt`)
4. wait
5. the downloads will be in `e621-id-downloader/dl`

# ids.txt schema
`ID1,ID2,ID3[...]`

an example `ids.txt` is also included with the repo

# todo
* make binaries idk
* handle errors better or something