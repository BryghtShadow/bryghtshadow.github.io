(async () => {
    let app = document.querySelector('#app');
    let { chars } = await getJson('building_data');
    let character_table = await getJson('character_table');

    function buffSorter(a, b) {
        let nameA = character_table[a.charId].name;
        let nameB = character_table[b.charId].name;
        return nameA.localeCompare(nameB, 'en', {
            ignorePunctuation: true,
            sensitivity: 'base'
        });
    }
    let toc = document.createElement('ul');
    toc.style = 'column-count: 5';
    let pre = document.createElement('pre');
    let PHASES = { PHASE_0: 'Base', PHASE_1: 'Elite 1', PHASE_2: 'Elite 2' };
    for (let char of Object.values(chars).sort(buffSorter)) {
        let { charId } = char;
        let buffs = [];
        for (let buffChar of char.buffChar) {
            for (let buff of buffChar.buffData) {
                buffs.push(buff);
            }
        }
        let sortedBuffs = buffs.sort((a, b) => {
            if (a.cond.phase < b.cond.phase) return -1;
            if (a.cond.phase > b.cond.phase) return 1;
            return a.cond.level - b.cond.level;
        });
        let baseSkill = '{{Base skills'
        for (let [i, { buffId: id, cond: { phase, level } }] of sortedBuffs.entries()) {
            baseSkill += `\n|id${i + 1} = ${id}`;
            if (phase !== 'PHASE_0') {
                baseSkill += `\n|cond${i + 1} = ${PHASES[phase]}`;
            }
            if (level > 1) {
                baseSkill += `\n|level${i + 1} = ${level}`;
            }
        }
        baseSkill += '\n}}\n';
        let line = document.createElement('div');
        line.className = 'line';
        let PAGENAME = character_table[charId].name;
        if (PAGENAME.includes('Justice Knight')) {
            PAGENAME = 'Justice Knight'
        }
        let PAGENAMEE = PAGENAME.replace(/ /g, '_');
        let href = `https://arknights.wiki.gg/wiki/${PAGENAMEE}#Base_skills`;
        let anchor = document.createElement('a')
        anchor.href = href;
        anchor.textContent = PAGENAME;
        anchor.id = PAGENAMEE;
        line.append('== ', anchor, ' ==\n', baseSkill);
        pre.append(line);

        let tocli = document.createElement('li');
        let toca = document.createElement('a');
        toca.textContent = PAGENAME;
        toca.href = '#' + PAGENAMEE;
        tocli.append(toca);
        toc.append(tocli);
    }
    app.append(toc, pre);
})();