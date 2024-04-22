const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const api = require("./api/index");

const app = express();
const PORT = process.env.PORT || 8000;
// view engine setup

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api", api);


app.get("/",(req,res)=>{
	res.send({status:200,message:"running"})
})

app.listen(PORT, () => {
	console.log(`Server running at PORT ${PORT}`);
});
module.exports = app;
