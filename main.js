(() => {
  let hlist = [
      { href: '/', text: 'Home' },
      { href: '/facility.html', text: 'Facility' },
      { href: '/operator.html', text: 'Operator' },
      { href: '/akchar.html', text: 'character_table' },
  ];
  let nav = document.querySelector('nav');
  let ul = document.createElement('ul');
  ul.className = 'hlist';
  for (var { href, text } of hlist) {
      let li = document.createElement('li');
      let a = document.createElement('a');
      a.href = href;
      a.textContent = text;
      li.appendChild(a);
      ul.appendChild(li);
  }
  nav.append(ul);
})();

async function getJson(filename, lang) {
  let repo = 'ArknightsGameData'
  let code = 'zh_CN'
  switch (lang) {
    case 'cn': repo = 'ArknightsGameData'; break
    default: repo = 'ArknightsGameData_YoStar'
  }
  switch (lang) {
    case 'cn': code = 'zh_CN'; break
    case 'en': code = 'en_US'; break
    case 'jp': code = 'ja_JP'; break
    case 'ko': code = 'ko_KR'; break
  }
  let url = `https://raw.githubusercontent.com/Kengxxiao/${repo}/refs/heads/main/${code}/gamedata/excel/${filename}.json`
  let resp = await fetch(url)
  let data = await resp.json()
  return data
}
