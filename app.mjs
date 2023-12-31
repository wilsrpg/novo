import express from 'express'
//import cors from 'cors'
import mysql from 'mysql2'
//import { config as dotenvConfig } from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb'
//import { Client as PGClient } from 'pg'
//const { Client: PGClient } = require('pg');
import Client from 'pg/lib/client.js'

//dotenvConfig();

const servidor = express();
servidor.use(express.json());
//servidor.use(cors({
	//origin: 'http://meudominio.com'
//}));
servidor.use(express.urlencoded({extended: false}));
//servidor.use(express.static('.'));

servidor.get('/', async (req, res)=>{
  res.sendFile('index.html', {root: '.'});
});

servidor.get('/favicon.svg', async (req, res)=>{
  res.sendFile('favicon.svg', {root: '.'});
});

servidor.get('/sucesso', async (req, res)=>{
  res.sendFile('sucesso.html', {root: '.'});
});

servidor.get('/erro', async (req, res)=>{
  res.sendFile('erro.html', {root: '.'});
});

servidor.post('/mysql', async (req, res) => {
  let porta = '';
  if (req.body.servidor.search(':') > 0) {
    porta = req.body.servidor.slice(req.body.servidor.search(':')+1);
    req.body.servidor = req.body.servidor.slice(0,req.body.servidor.search(':'));
  }
  const con = mysql.createConnection({
    host: req.body.servidor,
    port: porta,
    database: req.body.database,
    user: req.body.usuario,
    password: req.body.senha
  });
  console.log(
    'Tentando conexão com banco de dados MySQL:\n'
    +'host='+con.config.host+':'+con.config.port+'\ndb='+con.config.database+'\nuser='+con.config.user
  );
  const desconectado = await new Promise(resolve=>{
    con.ping(erro=>resolve(erro));
  });
  if(desconectado) {
    console.log('Conexão mal sucedida. Erro:\n'+desconectado);
    res.sendFile('erro.html', {root: '.'});
  } else {
    console.log('Conexão bem sucedida.');
    res.sendFile('sucesso.html', {root: '.'});
  }
});

servidor.post('/mongodb', async (req, res) => {
  const uri = 'mongodb+srv://'+req.body.usuario+':'+req.body.senha+'@'+req.body.servidor
    +'/?retryWrites=true&w=majority';
  const cliente = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  console.log(
    'Tentando conexão com banco de dados MongoDB:\n'
    +'host='+cliente.options.srvHost+'\ndb='+cliente.options.dbName+'\nuser='+cliente.options.credentials.username
  );
  try {
    await cliente.connect();
    await cliente.db("admin").command({ ping: 1 });
    await cliente.close();
    console.log('Conexão bem sucedida.');
    res.sendFile('sucesso.html', {root: '.'});
  } catch (erro) {
    console.log('Conexão mal sucedida. Erro:\n'+erro);
    await cliente.close();
    res.sendFile('erro.html', {root: '.'});
  }
});

servidor.post('/postgresql', async (req, res) => {
  let porta = '';
  if (req.body.servidor.search(':') > 0) {
    porta = req.body.servidor.slice(req.body.servidor.search(':')+1);
    req.body.servidor = req.body.servidor.slice(0,req.body.servidor.search(':'));
  }
  const cliente = new Client({
    host: req.body.servidor,
    port: porta,
    database: req.body.database,
    user: req.body.usuario,
    password: req.body.senha,
    ssl: true
  });
  console.log(
    'Tentando conexão com banco de dados PostgreSQL:\n'
    +'host='+cliente.host+':'+cliente.port+'\ndb='+cliente.database+'\nuser='+cliente.user
  );
  cliente.connect(function(erro) {
    if (erro) {
      console.log('Conexão mal sucedida. Erro:\n'+erro);
      res.sendFile('erro.html', {root: '.'});
    } else {
      console.log('Conexão bem sucedida.');
      res.sendFile('sucesso.html', {root: '.'});
    }
  });
});

servidor.get('/usuarios', async (req, res)=>{
  res.json({usuarios: [{nome: 'Nome1'},{nome: 'Nome2'},{nome: 'Nome3'}]});
});

servidor.listen(3333, ()=>console.log('iniciou server, ouvindo porta 3333'));