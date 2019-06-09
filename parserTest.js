module.exports = function (req, res, next) {
    let chunks = []
  
    req.on('data', function (data) {
      console.log("\x1b[36mDATA\x1b[0m", data)
      chunks.push(data)
    })

    req.on('end', function () {
      req.body = Buffer.concat(chunks);
      next()
    })
  }
  


  //  \x1b[36m %s \x1b[0m