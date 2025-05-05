import express from "ultimate-express"
import { readFileSync } from 'fs'
import { emojify } from "node-emoji"
const app = express()
const port = 6356
const NEKOCAFE_API = 'https://cafe.frizzbees.dev/';
const NEKOCAFE_URL = 'https://social.nekoweb.org/';
const NEKOCAFE_EMB = 'https://jb.is-a.dev/cafe/';
const NEKOWEB_API = 'https://nekoweb.org/api/';
const NEKOWEB_KEY = readFileSync('./key.txt', 'utf-8');

function unixSecondsToIso8601(unixSeconds) {
    const milliseconds = unixSeconds * 1000;
    const date = new Date(milliseconds);
    return date.toISOString();
}

app.set('catch async errors', true);

app.get('/cafe/post/', async (req, res) => {
    res.send(await getPost(req.query.id));
})

app.get('/cafe/post/:id', async (req, res) => {
    res.send(await getPost(req.params.id));
})

app.get('/cafe/cafeoembed', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify({
        type: 'rich',
        version: '1.0',
        author_name: req.query.author,
        author_url: NEKOCAFE_URL + 'post/?id=' + req.query.id,
        provider_name: 'Nekocafe',
        provider_url: NEKOCAFE_URL
    }))
})

async function getPost(id) {
    let template = readFileSync('./template.html', 'utf-8');
    let resp = await fetch(NEKOCAFE_API + 'get_post/' + id);
    let json = await resp.json();
    let user = await fetch(NEKOCAFE_API + 'get_profile/?name=' + json.name);
    console.log(user);
    let userJson = await user.json();
    template = template.replaceAll('%%NEKOCAFE-URL%%', NEKOCAFE_URL + 'post/?id=' + id);
    template = template.replaceAll('%%NEKOCAFE-POSTAUTHOR%%', json.name);
    template = template.replaceAll('%%NEKOCAFE-POSTDESC%%', emojify(json.post));
    template = template.replaceAll('%%NEKOCAFE-POSTSTATS%%', `🍪 ${json.likes}  💬 ${json.comments}`);
    template = template.replaceAll('%%NEKOCAFE-AUTHORIMG%%', userJson.image_url);
    template = template.replaceAll('%%NEKOCAFE-RELEASE%%', unixSecondsToIso8601(json.timestamp));
    template = template.replaceAll('%%NEKOCAFE-OEMBED%%', 
        NEKOCAFE_EMB + `cafeoembed?id=${id}&author=${json.name}`
    );
    return template;
}

app.get('/stats/:user', async (req, res) => {
    let template = readFileSync('./nekowebstats-template.html', 'utf-8');
    let resp = await fetch(NEKOWEB_API + 'site/info/' + req.params.user, {
        headers: {
            Authorization: NEKOWEB_KEY
        }
    });
    let siteJson = await resp.json();

    template = template.replaceAll('%%URL%%', `${req.params.user}.nekoweb.org`);
    template = template.replaceAll('%%USER%%', req.params.user + ': ' + decodeURIComponent(siteJson.title));
    template = template.replaceAll('%%STATS%%', `Updates: ${siteJson.updates}
Followers: ${siteJson.followers}
Views: ${siteJson.views}`);

    res.send(template);
})

app.listen(port, () => {
    console.log(`cafeembed listening on port ${port}`)
})