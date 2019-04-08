const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const sqlite = require('sqlite')
const dbConnection = sqlite.open('banco.sqlite', { Promise })

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', async(req, res) => {
    const db = await dbConnection
    const categoriasDB = await db.all('select * from categorias;')
    const vagas = await db.all('select * from vagas;')
    const categorias = categoriasDB.map(cat => {
        return {
            ...cat,
            vagas: vagas.filter( vaga => vaga.categoria === cat.id)
        }
    })
    res.render('home', { categorias, vagas })
})

app.get('/vaga/:id', async(req, res) => {
    const db = await dbConnection
    const vaga = await db.get('select * from vagas where id = '+req.params.id)
    res.render('vaga', { vaga })
})
app.get('/admin', (req, res) => {
    res.render('admin/home')
})
app.get('/admin/vagas', async(req, res) => {
    const db= await dbConnection
    const vagas = await db.all('select * from vagas;')    
    res.render('admin/vagas', { vagas })
})
app.get('/admin/categorias', async(req, res) => {
    const db= await dbConnection
    const categorias = await db.all('select * from categorias;')    
    res.render('admin/categorias', { categorias })
})
app.get('/admin/vagas/delete/:id', async(req, res) => {
    const db = await dbConnection
    await db.run('delete from vagas where id = '+req.params.id+ '')
    res.redirect('/admin/vagas')
})
app.get('/admin/categorias/delete/:id', async(req, res) => {
    const db = await dbConnection
    await db.run('delete from categorias where id = '+req.params.id+ '')
    res.redirect('/admin/categorias')
})
app.get('/admin/vagas/nova', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    res.render('admin/nova-vaga', { categorias })
})
app.get('/admin/categorias/nova', (req, res) => {
   res.render('admin/nova-categoria')
})
app.post('/admin/categorias/nova', async(req, res) => {
    const { categoria } = req.body   
    const db = await dbConnection
    await db.run(`insert into categorias(categoria) values('${categoria}')`)
    res.redirect('/admin/categorias')    
 })
app.get('/admin/vagas/editar/:id', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    const vaga = await db.get('select * from vagas where id = '+req.params.id)
    res.render('admin/editar-vaga', { categorias, vaga })
})
app.post('/admin/vagas/editar/:id', async(req, res) => {
    const { titulo, descricao, categoria } = req.body  
    const { id }  = req.params 
    const db = await dbConnection    
    await db.run(`update vagas set categoria = '${categoria}', titulo = '${titulo}', descricao = '${descricao}' where id = ${id}`)
    res.redirect('/admin/vagas')
})
app.get('/admin/categorias/editar/:id', async(req, res) => {
    const db = await dbConnection    
    const categoria = await db.get('select * from categorias where id = '+req.params.id)
    res.render('admin/editar-categoria', { categoria })
})
app.post('/admin/categorias/editar/:id', async(req, res) => {
    const { categoria } = req.body  
    const { id } = req.params    
    const db = await dbConnection    
    await db.run(`update categorias set categoria = '${categoria}' where id = ${id}`)
    res.redirect('/admin/categorias')
})
app.post('/admin/vagas/nova', async(req, res) => {
    const { titulo, descricao, categoria } = req.body   
    const db = await dbConnection
    await db.run(`insert into vagas(categoria, titulo, descricao) values('${categoria}', '${titulo}', '${descricao}') `)
    res.redirect('/admin/vagas')
})


const init = async() => {
    const db = await dbConnection
    await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);')    
    await db.run('create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);')       
}

init()
//coment

app.listen(3000, (err) => {
    if(err){
        console.log('Não foi possivel iniciar o servidor...')
    }else{
        console.log('Servidor do Jobify rodando...')
    }
})
