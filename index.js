const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");
require("dotenv").config();

const host = process.env.HOST;
const port = process.env.PORT;
const user = process.env.USER;
const password = process.env.PASSWORD;
const database = process.env.DATABASE;

const db = mysql.createPool({
  host: host,
  port: port,
  user: user,
  password: password,
  database: database,
  //connectTimeout: 60000, // 60 segundos
});

console.log("");
app.use(cors());
app.use(express.json());

app.get("/getdata", async (req, res) => {
  let SQL = `
select date_format(data_criacao, '%d/%m/%Y') as data, cast(data_criacao as time(0)) as hora, status, assunto, informe, CONCAT(SUBSTRING_INDEX(SUBSTRING_INDEX(nome_usuario , ' ', 1), ' ', -1), CASE WHEN LENGTH(nome_usuario) - LENGTH(REPLACE(nome_usuario, ' ', '')) >= 1 THEN concat(' ',SUBSTRING_INDEX(SUBSTRING_INDEX(nome_usuario, ' ', 2), ' ', -1)) ELSE null end) as nome_usuario, protocolo, matricula_usuario, replace(replace(textarea, '&quot', '"'), '  ', '\n') as textarea from qualihelp_v2.chamados order by data_criacao desc
  `;
  db.query(SQL, (err, result) => {
    if (err) console.log(err);
    else res.send(result);
  });
});

app.get("/chamadosAbertos", async (req, res) => {
  let SQL = "select count(*) as qtd from chamados where status = 'Aberto'";

  db.query(SQL, (err, result) => {
    if (err) console.log(err);
    else res.send(result);
  });
});

app.get("/chamadosFechados", async (req, res) => {
  let SQL = "select count(*) as qtd from chamados where status = 'fechado'";

  db.query(SQL, (err, result) => {
    if (err) console.log(err);
    else res.send(result);
  });
});

app.get("/chamadosTratativas", async (req, res) => {
  let SQL =
    "select count(*) as qtd from chamados where status = 'Em Tratativa'";

  db.query(SQL, (err, result) => {
    if (err) console.log(err);
    else res.send(result);
  });
});

app.get("/chamadosValidacao", async (req, res) => {
  let SQL =
    "select count(*) as qtd from chamados where status = 'Pendente de avaliação'";

  db.query(SQL, (err, result) => {
    if (err) console.log(err);
    else res.send(result);
  });
});

app.get("/motivos", async (req, res) => {
  let SQL =
    "select case when motivo = '' then 'Vazio' else motivo end as motivo , count(*) as qtd from chamados group by motivo";

  db.query(SQL, (err, result) => {
    if (err) console.log(err);
    else res.send(result);
  });
});

app.get("/solicitacoes", async (req, res) => {
  let SQL =
    "select solicitacao, count(*) as qtd from chamados group by solicitacao ";

  db.query(SQL, (err, result) => {
    if (err) console.log(err);
    else res.send(result);
  });
});

app.get("/criacaomes", async (req, res) => {
  const filtro = req.query;
  let SQL = `select 
          case when monthname(DATA_CRIACAO) = 'APRIL' then 'Abril'
          when monthname(data_criacao) = 'AUGUST' then 'Agosto'
          when monthname(data_criacao) = 'DECEMBER' then 'Dezembro'
          when monthname(data_criacao) = 'FEBRUARY' then 'Fevereiro'
          when monthname(data_criacao) = 'JANUARY' then 'Janeiro'
          when monthname(data_criacao) = 'JULY' then 'Julho'
          when monthname(data_criacao) = 'JUNE' then 'Junho'
          when monthname(data_criacao) = 'MARCH' then 'Março'
          when monthname(data_criacao) = 'MAY' then 'Maio'
          when monthname(data_criacao) = 'NOVEMBER' then 'Novembro'
          when monthname(data_criacao) = 'OCTOBER' then 'Outubro'
          when monthname(data_criacao) = 'SEPTEMBER' then 'Setembro'
          else 'VERIFICAR' end as MES,
          count(*) as qtd 
          from chamados 
          group by monthname(data_criacao)
    `;

  db.query(SQL, (err, result) => {
    if (err) console.log(err);
    else res.send(result);
  });
});
app.get("/nota", async (req, res) => {
  let SQL = `select avg(avaliacao) as nota  from qualihelp_v2.chamados where avaliacao <> ''`;

  db.query(SQL, (err, result) => {
    if (err) console.log(err);
    else res.send(result);
  });
});
app.get("/SLA", async (req, res) => {
  let SQL = `select CONCAT(FLOOR(AVG(timediff(data_fechamento, data_criacao))/86400), ' dias - ', floor(SEC_TO_TIME(AVG(timediff(data_fechamento, data_criacao)) % 86400))) as SLA from qualihelp_v2.chamados where status = 'Fechado'`;

  db.query(SQL, (err, result) => {
    if (err) console.log(err);
    else res.send(result);
  });
});

app.listen(3001, () => {
  console.log("Running...");
});
