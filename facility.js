; (async () => {
    let app = document.querySelector('#app');
    let PRETTY = false;
    let FACILITY = {
        control: { name: 'Control Center', icon: 'https://arknights.wiki.gg/images/c/cb/Control_Center.png?66da35' },
        dormitory: { name: 'Dormitory', icon: 'https://arknights.wiki.gg/images/0/0c/Dormitory.png?ed5d7a' },
        manufacture: { name: 'Factory', icon: 'https://arknights.wiki.gg/images/a/a3/Factory.png?b52bea' },
        hire: { name: 'Human Resource Office', icon: 'https://arknights.wiki.gg/images/7/78/Office.png?eeef3d' },
        power: { name: 'Power Plant', icon: 'https://arknights.wiki.gg/images/7/7c/Power_Plant.png?ce74b4' },
        meeting: { name: 'Reception Room', icon: 'https://arknights.wiki.gg/images/c/c2/Reception_Room.png?de1de1' },
        trading: { name: 'Trading Post', icon: 'https://arknights.wiki.gg/images/c/cc/Trading_Post.png?b92dfc' },
        training: { name: 'Training Room', icon: 'https://arknights.wiki.gg/images/d/d1/Training_Room.png?744fa7' },
        workshop: { name: 'Workshop', icon: 'https://arknights.wiki.gg/images/4/49/Workshop.png?6e6fb7' },
    }

    let { termDescriptionDict: terms, richTextStyles: styles } = await getJson('gamedata_const');

    function parseDesc(desc) {
        return desc.replace(/<@([\w.]+)>(.+?)<\/>/gs, (_, tag, content) => {
            switch (tag) {
                case 'cc.vup': tag = 'up'; break;
                case 'cc.vdown': tag = 'down'; break;
                case 'cc.rem': tag = 'rem'; break;
                case 'cc.kw': tag = 'kw'; break;
            }
            return `{{Color|${content}|${tag}}}`;
        }).replace(/<\$([\w.]+)>(.+?)<\/>/gs, (_, tag, content) => {
            let termName;
            switch (tag) {
                case 'cc.c.abyssal2_1': termName = "Special Bonus 1"; break;
                case 'cc.c.abyssal2_2': termName = "Special Bonus 2"; break;
                case 'cc.c.abyssal2_3': termName = "Special Interaction Rules 1"; break;
                case 'cc.t.strong2': termName = "Special Interaction Rules 2"; break;
                default: termName = terms[tag].termName;
            }
            return `{{G|${termName}|${content}}}`;
        });
    }

    function copy(text) {
        var input = document.createElement('textarea');
        input.innerHTML = text;
        document.body.appendChild(input);
        input.select();
        var result = document.execCommand('copy');
        document.body.removeChild(input);
        return result;
    }

    // build tabs
    function initTabs() {
        let checked = localStorage.getItem('facility') || Object.keys(FACILITY)[0];
        let tabs = document.createElement('div');
        tabs.classList.add('tabs');

        for (let [k, v] of Object.entries(FACILITY)) {
            let tab = document.createDocumentFragment();

            let input = document.createElement('input');
            input.id = k;
            input.type = 'radio';
            input.name = 'tabs';
            input.checked = k == checked;
            input.addEventListener('change', {
                id: k,
                handleEvent(event) {
                    localStorage.setItem('facility', this.id);
                }
            });

            let label = document.createElement('label');
            // label.classList.add('label');
            label.setAttribute('for', k);
            label.append(v.name);

            let pre = document.createElement('pre');
            pre.classList.add('tab-content');
            pre.setAttribute('tabindex', 1);
            pre.id = k + '-content';

            let header = document.createElement('div');
            header.textContent = 'Wikitext';
            header.classList.add('header');

            let button = document.createElement('button');
            button.type = 'button';
            let icon = document.createElement('span');
            icon.classList.add('material-icons', 'content_copy');

            let statusText = document.createElement('span');
            statusText.textContent = 'Copy';

            button.append(icon, statusText);
            header.append(button);

            let code = document.createElement('code');
            code.classList.add('language-wiki');
            pre.append(header, code);

            tab.append(input, label, pre);
            tabs.append(tab);

            let timer;

            function startTimer() {
                timer = setTimeout(function () {
                    statusText.textContent = 'Copy';
                    icon.classList.toggle('content_copy');
                    icon.classList.toggle('done');
                }, 2000);
            }
            button.addEventListener('click', {
                handleEvent(event) {
                    clearTimeout(timer);
                    let text = code.textContent;
                    statusText.textContent = 'Copied!';
                    icon.classList.toggle('content_copy');
                    icon.classList.toggle('done');
                    copy(text);
                    startTimer();
                }
            });
        }

        app.append(tabs);
    }

    async function initContent() {
        function buffSorter(a, b) {
            return a.buffName.localeCompare(b.buffName, 'en', {
                ignorePunctuation: true,
                sensitivity: 'base'
            });
        }
        function buffGrouper({ buffName, buffIcon, skillIcon, description }) {
            return JSON.stringify({
                name: buffName,
                facility: buffIcon,
                icon: skillIcon.replace(/^bskill?_(.+)$/, 'Skill-$1.png'),
                desc: description,
            });
        }
        let PIPE = PRETTY ? '| ' : '|';
        let EQUALS = PRETTY ? ' = ' : '=';
        let NEWLINE = PRETTY ? '\n' : '';
        function paramMapper([param, value]) {
            let delimiter = document.createElement('span');
            delimiter.classList.add('template-delimiter');
            delimiter.append(PIPE);

            let argName = document.createElement('span');
            argName.classList.add('template-argument-name');
            argName.dataset.param = param;
            argName.append(param, EQUALS);

            let argValue = document.createElement('span');
            argValue.classList.add('template-argument-value');
            argValue.dataset.param = param;
            argValue.append(value);

            return [delimiter, argName, argValue];
        }

        let { buffs, chars } = await getJson('building_data');
        let sortedBuffs = Object.values(buffs).sort(buffSorter);
        let groupedBuffs = Object.groupBy(sortedBuffs, buffGrouper);
        for (let [key, objs] of Object.entries(groupedBuffs)) {
            let obj = JSON.parse(key);
            let base = obj.facility;
            let page = document.querySelector(`#${base}-content code`);
            let ids = objs.map(o => o.buffId).join(', ');
            delete obj.facility
            obj.desc = parseDesc(obj.desc);
            let params = { id: ids, ...obj };

            let row = document.createElement('div');
            row.classList.add('line');
            row.append(
                '{{Base skill cell',
                ...Object.entries(params).map(paramMapper).flat(),
                '}}\n',
            );
            page.append(row);
        }
    }

    initTabs();
    initContent();
})();