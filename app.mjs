import express from "express";
import log from "@ajar/marker";
import morgan from "morgan";
import fs from "fs/promises";
import path from "path";

import usersRouter from "./routers/users.router.mjs";

import myUsersRouter from "./routers/myusers.router.mjs";

//env new
const { PORT, HOST } = process.env;
const err_path= path.resolve("./logs/errors.log")
const app = express();

app.use(morgan("dev"));
app.use(express.json());

app.use("/users", usersRouter);
app.use("/myusers", myUsersRouter);



// async function readErrors(req,res,next){
//   const content = await fs.readFile(err_path, "utf8");
//   // req.writeErros = JSON.parse(content);
//   req.writeErros = content;
//   next();
// }



app.use(async (err, req, res, next )=> {
    log.error(err);
    //TODO: log to errors.log file
    // req.writeErros = req.writeErros + `${req.url} ${Date.now()} ${err}`
    await fs.appendFile(err_path,`${req.originalUrl} ${err.message} ${Date.now()}`);
    res.status(500).json({message:err.message})
})

app.use("*", async (req, res) => {
  // req.writeErros = req.writeErros + `${req.originalUrl} ${Date.now()}`
  console.log(req.writeErros)
  await fs.appendFile(err_path,`${req.originalUrl} path was not found ${Date.now()} \n `);
  res.status(404).send(`<h1>path ${req.originalUrl} was not found...</h1>`);
});

//start the server
(async () => {
  await app.listen(PORT, HOST);
  log.magenta(`🌎  listening on`, `http://${HOST}:${PORT}`);
})();
