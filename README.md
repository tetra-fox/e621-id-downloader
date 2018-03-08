# e621-id-downloader
download e621 images from a list of ids

![](https://i.imgur.com/bWWClX6.gif)

# usage
1. make sure [node.js](https://nodejs.org/) is installed
2. download/clone this repo
3. in the repo, run `node index [comma separated ids file]` (if no file is supplied, it will default to `ids.txt`)
4. wait
5. the downloads will be in `e621-id-downloader/dl`

# concurrent downloading

![](https://thumbs.gfycat.com/NaiveSeveralFlies-size_restricted.gif)

To allow concurrent downloads, use `concurrent.js` instead of `index.js`. It's essentially the same thing,
except it accepts these optional arguments:

- `-i` - The input `ids` file, defaults to `./ids.txt`
- `-o` - The output directory, defaults to `./dl`
- `-c, --max-concurrent` - The maximum allowed concurrent downloads, defaults to (and is not recommended to go above) `5`
- `--use-ids` - Pass this argument to use post IDs as the filename instead of the md5 hash
- `-s, --search` - Pass a search query with this argument to download posts that match it, e.g. `-s "rating:s canine"`
- `-l, --limit` - If using `-s`, limit the number of posts to search for by this number, defaults to `10` 

# ids.txt schema
`ID1,ID2,ID3[...]`

an example `ids.txt` is also included with the repo

# todo
* make binaries idk
* handle errors better or something
