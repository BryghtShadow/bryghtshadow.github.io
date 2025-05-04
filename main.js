async function getJson(filename) {
  let url = `https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData_YoStar/refs/heads/main/en_US/gamedata/excel/${filename}.json`
  let resp = await fetch(url)
  let data = await resp.json()
  return data
}
