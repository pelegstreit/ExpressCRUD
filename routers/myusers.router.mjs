import { Router } from "express";
import log from "@ajar/marker";
import { uuid } from "uuidv4";
import fs from "fs/promises";
import path from "path";

const DB_PATH = path.resolve("./db/db.json");
const log_path= path.resolve("./logs/http.log")
const router = Router();

async function getUsers(req,res,next){
    const content = await fs.readFile(DB_PATH, "utf8");
    req.users = JSON.parse(content);
    next();
}
router.use(getUsers);

// async function readLogs(req,res,next){
//   const logs = await fs.readFile(log_path, "utf8");
//   req.writeLogs = logs;
//   next();
// }



//allusers
router.get("/", async (req, res, next) => {
    try {
      res.status(200).json(req.users);
      await fs.appendFile(log_path,`${req.method} ${req.originalUrl} ${Date.now()}`);
    //   log.blue("this is req.users:",req.users)
    // log.red(typeof req.users)
    } catch (err) {
      next(err);
    }
  });

//createUsres
router.post("/", async (req,res)=>{
  req.users.push({...req.body, id:uuid() })
  await fs.writeFile(DB_PATH,JSON.stringify(req.users))
  // await fs.writeFile(log_path,JSON.stringify(req.writeLogs, `${req.originalUrl} ${req.method} ${Date.now()}`));
  const newLog=`${req.originalUrl} ${req.method} ${Date.now()}`
  console.log(req.writeLogs)
  req.writeLogs= req.writeLogs + newLog
  await fs.appendFile(log_path,`${req.method} ${req.originalUrl} ${Date.now()} \n`);
  res.status(200).send("created new user");
})

//getuserbyID
router.get("/:id", async (req, res, next) => {
    try {
        let requestedUser = req.users.find(user => req.params.id === user.id)
        await fs.appendFile(log_path,`${req.method} ${req.originalUrl} ${Date.now()} \n`);
      res.status(200).send(requestedUser);

    } catch (err) {
      next(err);
    }
  });

//update user with put
router.put("/:id",async (req, res, next) => {
    try {
        let user2Change = req.users.map((user) =>{
            if(req.params.id === user.id){
                log.blue(`i found your user:${req.params.id}`)
                log.green({...user})
                return {...req.body, id: req.params.id}
            }
            else{
                log.red({...user})
                return user;
            }
        });
        await fs.appendFile(log_path,`${req.method} ${req.originalUrl} ${Date.now()} \n`);
        await fs.writeFile(DB_PATH,JSON.stringify(user2Change))   
        res.status(200).send(`user ${req.params.id} changed`);
    } 
    catch (err) {
        next(err);}
  });
//UPDATE USER with patch
router.patch("/:id", async (req, res, next) => {
    try {
      let user2Change = req.users.map((user) =>{
        if(req.params.id === user.id){
            log.blue(`i found your user:${req.params.id}`)
            return {...user, ...req.body}
        }
        else{
            return user;
        }
    });
    await fs.appendFile(log_path,`${req.method} ${req.originalUrl} ${Date.now()} \n`);
    await fs.writeFile(DB_PATH,JSON.stringify(user2Change))   
    res.status(200).send(`user ${req.params.id} changed`);
    } catch (err) {
      next(err);
    }
  });

//delete user
// router.delete("/:id", async (req, res, next) => {
//     try {
//       const { id } = req.params;
//       const newUsers = req.users.filter((user) => user.id !== id)
//       await fs.writeFile(DB_PATH,JSON.stringify(newUsers))   
//       res.status(200).send(`this user was deleted: ${id}`);
//     } catch (err) {
//       next(err);
//     }
//   });

  //delete user- using findIndex and splice.
  router.delete("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const toDeleteIndex = req.users.findIndex(user => user.id === id)
      log.info("index to remove is:",toDeleteIndex);
      const deleted = req.users.splice(toDeleteIndex, 1);
      await fs.appendFile(log_path,`${req.method} ${req.originalUrl} ${Date.now()} \n`);
      await fs.writeFile(DB_PATH,JSON.stringify(req.users));
      res.status(200).send(`this user was deleted: ${id}`);
    } catch (err) {
      next(err);
    }
  });


export default router;