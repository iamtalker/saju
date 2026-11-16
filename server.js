const http=require('http');
const fs=require('fs');
const path=require('path');
const {calculate}=require('./engine');
const port=Number(process.env.SAJU_PORT)||3210;
const files={'/':['index.html','text/html; charset=utf-8'],'/app.js':['app.js','text/javascript; charset=utf-8'],'/reading.js':['reading.js','text/javascript; charset=utf-8'],'/style.css':['style.css','text/css; charset=utf-8']};
const server=http.createServer((req,res)=>{
  if(req.method==='GET'&&files[req.url]){const [name,type]=files[req.url];res.writeHead(200,{'Content-Type':type});return fs.createReadStream(path.join(__dirname,name)).pipe(res);}
  if(req.method==='POST'&&req.url==='/api/calculate'){
    let body='';req.on('data',x=>{body+=x;if(body.length>10000)req.destroy();});
    return req.on('end',()=>{try{const result=calculate(JSON.parse(body));res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(result));}catch(e){res.writeHead(400,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify({error:e.message}));}});
  }
  res.writeHead(404);res.end();
});
let shuttingDown=false;
function shutdown(){
  if(shuttingDown)return;
  shuttingDown=true;
  clearInterval(ownerWatch);
  if(!server.listening){process.exit(0);return;}
  server.close(()=>process.exit(0));
  server.closeAllConnections?.();
  setTimeout(()=>process.exit(0),1500).unref();
}
for(const signal of ['SIGINT','SIGTERM','SIGBREAK','SIGHUP']){
  try{process.on(signal,shutdown);}catch{}
}
process.stdin.on('end',shutdown);
process.stdin.on('close',shutdown);
process.stdin.resume();
const ownerPid=process.ppid;
const ownerWatch=setInterval(()=>{
  try{process.kill(ownerPid,0);}
  catch(error){if(error.code==='ESRCH')shutdown();}
},1000);
ownerWatch.unref();
server.listen(port,'127.0.0.1',()=>console.log(`사주 프로그램: http://127.0.0.1:${port} · 종료하려면 Ctrl+C 또는 이 창을 닫으세요`));
