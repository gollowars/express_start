module.exports = function errorHandler(err, req, res, next){
  if(err.status == 404){
    res.status(404).send("Not Found")
  }else {
    console.error(err.message)
    res.status(500).send("Internal Server Error")
  }
}