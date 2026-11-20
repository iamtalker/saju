const http=require('http');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const {calculate}=require('./engine');
const port=Number(process.env.SAJU_PORT)||3210;
const pkg=require('./package.json');
const serverRunId=crypto.randomBytes(16).toString('hex');
const presenceClients=new Set();
let idleShutdownTimer=null;
let everConnected=false;
const files={'/':['index.html','text/html; charset=utf-8'],'/deep-reading.js':['deep-reading.js','text/javascript; charset=utf-8'],'/compat-reading.js':['compat-reading.js','text/javascript; charset=utf-8'],'/app.js':['app.js','text/javascript; charset=utf-8'],'/reading.js':['reading.js','text/javascript; charset=utf-8'],'/fun-reading.js':['fun-reading.js','text/javascript; charset=utf-8'],'/extra-reading.js':['extra-reading.js','text/javascript; charset=utf-8'],'/profile.js':['profile.js','text/javascript; charset=utf-8'],'/style.css':['style.css','text/css; charset=utf-8']};
const server=http.createServer((req,res)=>{
  if(req.method==='GET'&&req.url==='/'){ return fs.readFile(path.join(__dirname,'index.html'),'utf8',(error,html)=>{ if(error){res.writeHead(500);return res.end();} res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}); res.end(html.replace('__APP_VERSION__',pkg.version).replace('__SERVER_RUN_ID__',serverRunId)); }); }
  if(req.method==='GET'&&req.url==='/api/presence'){
    everConnected=true;
    clearTimeout(idleShutdownTimer);
    idleShutdownTimer=null;
    presenceClients.add(res);
    res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});
    res.write('retry: 2000\n: tab connected\n\n');
    res.on('close',()=>{
      presenceClients.delete(res);
      if(everConnected&&presenceClients.size===0&&!shuttingDown){
        idleShutdownTimer=setTimeout(()=>{
          if(presenceClients.size===0)shutdown();
        },10000);
        idleShutdownTimer.unref();
      }
    });
    return;
  }
  if(req.method==='GET'&&files[req.url]){const [name,type]=files[req.url];res.writeHead(200,{'Content-Type':type});return fs.createReadStream(path.join(__dirname,name)).pipe(res);}
  if(req.method==='POST'&&req.url==='/api/calculate'){
    let body='';req.on('data',x=>{body+=x;if(body.length>10000)req.destroy();});
    return req.on('end',()=>{try{const result=calculate(JSON.parse(body));result.version=pkg.version;res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(result));}catch(e){res.writeHead(400,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify({error:e.message}));}});
  }
  res.writeHead(404);res.end();
});
let shuttingDown=false;
function shutdown(){
  if(shuttingDown)return;
  shuttingDown=true;
  clearTimeout(idleShutdownTimer);
  if(!server.listening){process.exit(0);return;}
  server.close(()=>process.exit(0));
  server.closeAllConnections?.();
  setTimeout(()=>process.exit(0),1500).unref();
}
for(const signal of ['SIGINT','SIGTERM','SIGBREAK','SIGHUP']){
  try{process.on(signal,shutdown);}catch{}
}
server.on('error',error=>{ if(error.code==='EADDRINUSE'){ console.error(`Port ${port} is already in use. Run 실행하기.cmd again to stop the old process and restart.`); process.exit(1); } throw error; });
server.listen(port,'127.0.0.1',()=>console.log(`사주 프로그램 v${pkg.version}: http://127.0.0.1:${port} · 브라우저 탭을 닫으면 10초 뒤 종료됩니다`));
