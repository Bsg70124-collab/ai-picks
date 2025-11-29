// retrain.js  (runs inside GitHub Action)
import fs from 'fs';
import {LogisticRegression} from 'ml-logistic-regression';

const hist = JSON.parse(fs.readFileSync('localHist.json','utf8')).filter(r=>r.result);
if (hist.length < 30){console.log('Need 30+ graded games'); process.exit(0);}

// same 9-feature vector you use in browser
const X = hist.map(r=>[0,0,2,2,r.spread,50,0,0,50]);
const y = hist.map(r=>r.result==='W'?1:0);

const lr = new LogisticRegression({numSteps:2000, learningRate:5e-4});
lr.train(X,y);

const w = lr.weights[0].slice(1);        // 9 weights
const b = lr.weights[0][0];              // intercept

// replace weights inside index.html
let html = fs.readFileSync('index.html','utf8');
html = html.replace(/const W = \[.*?\];/s, `const W = [${w.map(v=>v.toFixed(3)).join(',')}];`)
           .replace(/const b = .*;/,    `const b = ${b.toFixed(3)};`);
fs.writeFileSync('index.html',html);
console.log('Retrain complete → new weights pushed');
