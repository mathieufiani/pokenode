const express = require('express');
const exphbs = require('express-handlebars');
const fetch = require('node-fetch');
const bodyparsr = require('body-parser');
const path = require('path');

const helpers = require('handlebars-helpers')(['string']);

require('dotenv').config();

const PORT = process.env.PORT || 5000

const app = express();

//higher order function to catch simplify try / catch
const catchError = asyncFunction => (...args) => asyncFunction(...args).catch(console.error);

const getAllPokemon = catchError(async () => {
    const res = await fetch('https://pokeapi.co/api/v2/pokemon/?limit=151');
    return await res.json();
});

const getPokemon = catchError(async (pokemon) => {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
    return await res.json();
});

//middleware
app.use(express.static(path.join(__dirname, 'public')));

app.engine('.hbs', exphbs.engine({extname: '.hbs'}));
app.set('view engine', '.hbs');
app.use(bodyparsr.urlencoded({extended: false}));

//get root from handlebars
app.get('/', catchError(async (_, res) => {
    const pokemons = await getAllPokemon();
    res.render('home', {pokemons});
}));

app.post('/search', (req, res)=>{
    const search = req.body.search;
    res.redirect(`/${search}`);
});

app.get('/notFound', (_, res) => res.render('notFound'));

app.get('/:search', catchError(async (req, res) => {
    const search = req.params.search;
    const pokemon = await getPokemon(search);
    pokemon ? res.render('pokemon', {pokemon}) : res.redirect('/notFound')
}));


app.listen(PORT, () => console.log(`Express is listening on port ${PORT}`));

