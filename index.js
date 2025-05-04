import express from "ultimate-express"
import { readFileSync } from 'fs'
const app = express()
const port = 6356
const NEKOCAFE_API = 'https://cafe.frizzbees.dev/';
const NEKOCAFE_URL = 'https://social.nekoweb.org/';
const NEKOCAFE_EMB = 'https://jb.is-a.dev/cafe/';

function unixSecondsToIso8601(unixSeconds) {
    const milliseconds = unixSeconds * 1000;
    const date = new Date(milliseconds);
    return date.toISOString();
}

app.set('catch async errors', true);

app.get('/cafe/post/', async (req, res) => {
    let template = readFileSync('./template.html', 'utf-8');
    let id = req.query.id;
    let resp = await fetch(NEKOCAFE_API + 'get_post/' + id);
    let json = await resp.json();
    let user = await fetch(NEKOCAFE_API + 'get_profile/?name=' + json.name);
    console.log(user);
    let userJson = await user.json();
    template = template.replaceAll('%%NEKOCAFE-URL%%', NEKOCAFE_URL + 'post/?id=' + id);
    template = template.replaceAll('%%NEKOCAFE-POSTAUTHOR%%', json.name);
    template = template.replaceAll('%%NEKOCAFE-POSTDESC%%', json.post);
    template = template.replaceAll('%%NEKOCAFE-POSTSTATS%%', `🍪 ${json.likes}  💬 ${json.comments}`);
    template = template.replaceAll('%%NEKOCAFE-AUTHORIMG%%', userJson.image_url);
    template = template.replaceAll('%%NEKOCAFE-RELEASE%%', unixSecondsToIso8601(json.timestamp));
    template = template.replaceAll('%%NEKOCAFE-OEMBED%%', 
        NEKOCAFE_EMB + `cafeoembed?id=${id}&author=${json.name}`
    );
    res.send(template);
})

app.get('/cafe/cafeoembed', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify({
        type: 'rich',
        version: '1.0',
        author_name: req.query.author,
        author_url: NEKOCAFE_URL + 'post/?id=' + req.query.id,
        provider_name: 'Nekocafe',
        provider_url: NEKOCAFE_URL,
        title: 'Nekocafe'
    }))
})

app.listen(port, () => {
    console.log(`cafeembed listening on port ${port}`)
})