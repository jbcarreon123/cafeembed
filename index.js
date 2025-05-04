import express from "ultimate-express"
import { readFileSync } from 'fs'
const app = express()
const port = 6356
const NEKOCAFE_API = 'https://cafe.frizzbees.dev/';
const NEKOCAFE_URL = 'https://social.nekoweb.org/';

app.set('catch async errors', true);

app.get('/cafe/post/', async (req, res) => {
    let template = readFileSync('./template.html', 'utf-8');
    let id = req.query.id;
    let resp = await fetch(NEKOCAFE_API + 'get_post/' + id);
    let json = await resp.json();
    let user = await fetch(NEKOCAFE_API + 'get_profile/?name=' + json.name);
    console.log(user);
    let userJson = await user.json();
    template = template.replaceAll('%%NEKOCAFE-URL%%', NEKOCAFE_URL + 'post/?id=xbol06qt4d');
    template = template.replaceAll('%%NEKOCAFE-POSTAUTHOR%%', json.name);
    template = template.replaceAll('%%NEKOCAFE-POSTDESC%%', json.post);
    template = template.replaceAll('%%NEKOCAFE-POSTSTATS%%', `🍪 ${json.likes}  💬 ${json.comments}`);
    template = template.replaceAll('%%NEKOCAFE-AUTHORIMG%%', userJson.image_url);
    res.send(template);
})

app.listen(port, () => {
    console.log(`cafeembed listening on port ${port}`)
})