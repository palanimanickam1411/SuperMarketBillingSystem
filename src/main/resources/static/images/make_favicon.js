const fs = require('fs');
const img = fs.readFileSync('billbeelogo.png');
const b64 = img.toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <clipPath id="circleView">
      <circle cx="50" cy="50" r="50"/>
    </clipPath>
  </defs>
  <image width="100" height="100" href="data:image/png;base64,${b64}" clip-path="url(#circleView)" preserveAspectRatio="xMidYMid slice"/>
</svg>`;
fs.writeFileSync('favicon.svg', svg);
