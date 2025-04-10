Jian = {
    debug: true, // 调试开关
    var: {},
    console: { // 输出到控制台
        success: (m) => {
            /*
            success(m)
            @param  m all
            @return undefined
            */
            if (Jian.debug) { // 判断是否调试
                console.log(`%c${m}`, 'border-left: 5px solid green;text-decoration: none;border-radius: 3px;color:#000 !important;background:write;padding: 3px');
            }
        }, warning: (m) => {
            /*
            warning(m)
            @param  m all
            @return undefined
            */
            if (Jian.debug) {
                console.log(`%c${m}`, 'border-left: 5px solid yellow;text-decoration: none;border-radius: 3px;color:#000 !important;background:write;padding: 3px');
            }
        }, info: (m) => {
            if (Jian.debug) {
                console.log(`%c${m}`, 'border-left: 5px solid dodgerblue;text-decoration: none;border-radius: 3px;color:#000 !important;background:write;padding: 3px');
            }
        }, error: (m) => {
            if (Jian.debug) {
                console.log(`%c${m}`, 'border-left: 5px solid red;text-decoration: none;border-radius: 3px;color:#000 !important;background:write;padding: 3px');
            }
        }, debug: (m) => {
            if (Jian.debug) {
                console.log(`%c${m}`, 'border-left: 5px solid gray;text-decoration: none;border-radius: 3px;color:#000 !important;background:write;padding: 3px');
            }
        }, logo: () => {
            console.log(`%c     _ _             \n    | (_) __ _ _ __  \n _  | | |/ _\\\` | '_ \\\n| |_| | | (_| | | | |\n \\___/|_|\\__,_|_| |_|`, "color:white;!important;background:dodgerblue;padding: 3px;text-align: center;")
        }
    }, plugins: {
        lazyload: function () {
            var viewHeight = document.documentElement.clientHeight;
            var eles = document.querySelectorAll('img[lazyload]');
            Array.prototype.forEach.call(eles, function (item, index) {
                var rect;
                if (item.getAttribute('lazyload') === "") return;
                rect = item.getBoundingClientRect();// 用于获得页面中某个元素的左，上，右和下分别相对浏览器视窗的位置
                if (rect.bottom >= 0 && rect.top < viewHeight) {
                    !function () {
                        var img = new Image();
                        img.src = item.getAttribute('lazyload');
                        img.onload = function () {
                            item.src = img.src;
                            Jian.console.success(img.src + ' 加载成功');
                            let Event = new CustomEvent('Jian:lazyload:load', { detail: { url: img.src, dom: item } })
                            document.dispatchEvent(Event);
                            window.dispatchEvent(Event);
                        }
                        img.onerror = function () {
                            if (!item.again) { item.again = 0 } else if (item.again >= 5) { return } // 重试次数限制
                            item.again++;
                            item.setAttribute("lazyload", img.src);
                            Jian.console.error(img.src + ' 加载失败');
                            let Event = new CustomEvent('Jian:lazyload:error', {
                                detail: {
                                    url: img.src, dom: item
                                }
                            })
                            document.dispatchEvent(Event);
                            window.dispatchEvent(Event);
                        }
                        item.removeAttribute("lazyload");
                    }()
                }
            })
        }, read: function (open = true) {
            if ((!document.body.classList.contains('read')) && open) {
                document.body.classList.add('read');
                document.body.classList.remove('dark');
                let Event = new CustomEvent('Jian:read', { detail: true })
                document.dispatchEvent(Event);
                window.dispatchEvent(Event);
            } else {
                document.body.classList.remove('read');
                if (localStorage.getItem("dark") === 'true') {
                    Jian.dark.set(true);
                } else if (localStorage.getItem("dark") === 'false') {
                    Jian.dark.set(false);
                } else {
                    Jian.dark.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
                }
                let Event = new CustomEvent('Jian:read', { detail: false })
                document.dispatchEvent(Event);
                window.dispatchEvent(Event);
            }
        }
    }, onload: {
        list: [], // 加载列表
        state: false,
        Promise: function (fn, ...e) {
            return new Promise(function (r) {
                r(fn(...e))
            })
        }, add: function (fn, ...e) {
            /*
            用于增加加载列表
            fn：运行的函数
            e：函数参数
             */
            if (!typeof fn === "function") {
                Jian.console.error("onload function must have name(string), f(functicon)");
            }
            if (this.state) {
                try {
                    fn(...e);
                } catch (e) {
                    Jian.console.error(e);
                }
            } else {
                this.list.push({ fn: fn, e: e })
            }
            let Event = new CustomEvent('Jian:add_onload', { detail: { fn: fn, e: e } })
            document.dispatchEvent(Event);
            window.dispatchEvent(Event);
        }, run: function (onload = false) {
            /*
            运行加载列表中的函数
            */
            if (this.state) { return 0; }
            this.state = true;
            let promises = []
            for (let i = 0; i < this.list.length; i++) {
                promises.push(this.Promise(this.list[i].fn, ...this.list[i].e))
            }
            Promise.all(promises).then(() => {
                Jian.console.info("全部异步并发函数运行完毕！");
            }).catch((e) => {
                Jian.console.info("异步并发函数运行出错"+e);
            });
            let Event = new CustomEvent('Jian:onload', { detail: { list: this.list } })
            document.dispatchEvent(Event);
            window.dispatchEvent(Event);
        }
    }, dark: {
        set: function (n) {
            Jian.console.info((n) ? '切换为暗色模式' : '切换为亮色模式');
            if (typeof n !== 'boolean') {
                Jian.console.error('set(n),n must be a boolean');
            }
            Jian.var.dark = n;
            let Event = new CustomEvent('Jian:dark_set', { detail: Jian.var.dark })
            document.dispatchEvent(Event);
            window.dispatchEvent(Event);
            localStorage.setItem("dark", n)
            if (n) {
                document.body.classList.add('dark');
            } else {
                document.body.classList.remove('dark');
            }
        }, change: function () {
            if (Jian.var.dark) {
                this.set(false);
            } else {
                this.set(true);
            }
        }
    }, load: {
        js: function (uri, f = undefined) {
            Jian.onload.add(function (uri, fn) {
                if (document.querySelector(`script[type="text/javascript"][src="${uri}"]`)) {
                    if (typeof fn == "function") { fn() }
                    return;
                }
                var script = document.createElement('script'), fn = fn || function () {
                };
                window.dispatchEvent(new CustomEvent('Jian:onload_js', { detail: { url: uri, fn: fn } }));
                script.type = 'text/javascript';
                script.onload = function () {
                    Jian.console.success(uri + ' 加载成功')
                    if (typeof fn == "function") { fn() }
                };
                script.onerror = function () {
                    Jian.console.error(uri + ' 加载失败')
                };
                script.src = uri;
                document.getElementsByTagName('head')[0].appendChild(script);
            }, uri, f)
        }, css: function (uri, f = undefined) {
            Jian.onload.add(function (uri, fn = undefined) {
                if (document.querySelector(`link[rel="stylesheet"][href="${uri}"]`)) {
                    if (typeof fn == "function") { fn() }
                    return;
                }
                var css = document.createElement('link'), fn = fn || function () {
                };
                window.dispatchEvent(new CustomEvent('Jian:onload_css', { detail: { url: uri, fn: fn } }));
                css.rel = "stylesheet";
                css.href = uri;
                css.onload = function () {
                    Jian.console.success(uri + ' 加载成功')
                    if (typeof fn == "function") { fn() }
                };
                css.onerror = function () {
                    Jian.console.error(uri + ' 加载失败')
                };
                document.getElementsByTagName('head')[0].appendChild(css);
            }, uri, f);
        }
    }, msg: function (obj) {
        document.msg = document.getElementById('msg');
        let id = `MsgCard-${new Date().getTime()}`
        document.msg.innerHTML = `<div class="card w-full ${(obj.color) ? 'bg-' + obj.color : ''}" id="${id}"><div><div class="title"><i class="${obj.icon || ''}"></i> ${obj.title || ''}</div><div class="text">${obj.msg || obj.text || ''}</div></div></div>` + document.msg.innerHTML;
        if (typeof obj.click == 'function') {
            document.getElementById(id).addEventListener('click', obj.click);
        }
        let Event = new CustomEvent('Jian:onmsg', { detail: obj });
        document.dispatchEvent(Event);
        window.dispatchEvent(Event);
        setTimeout(function (myselfid) {
            let Event = new CustomEvent('Jian:add_onload', { detail: myselfid })
            document.dispatchEvent(Event);
            window.dispatchEvent(Event);
            document.getElementById(myselfid).remove();
        }, obj.timeout || 3000, id);
    }, loading: function (isShow, timeWait) {
        timeWait = (timeWait) ? timeWait : 1000
        document.body.querySelector("div.loading_page").querySelector("style").innerText = (isShow) ? "*{transition:none}.loading_i{visibility:visible}body{visibility:hidden}" : "";
        setTimeout((isShow) => {
            document.body.querySelector("div.loading_page").style.visibility = (isShow) ? "visible" : "hidden";
            document.body.style.visibility = (!isShow) ? "visible" : "hidden";
        }, (!isShow) ? timeWait : 0, isShow)
    }
}


DOMLoadStartTime = new Date().getTime();

Jian.onload.add(() => {
    for (let imgObj of document.querySelectorAll("article div.content p > img[alt]")) {
        let alt = imgObj.getAttribute("alt") || undefined;
        imgObj.outerHTML = imgObj.outerHTML + `<span class="img-content">${alt || ""}</span>`
    }
    for (let checkboxObj of document.querySelectorAll("input[type=\"checkbox\"]")) { checkboxObj.classList.add("checkbox"); checkboxObj.classList.add("bg-blue") }
})

window.addEventListener('DOMContentLoaded', function () {
    Jian.console.info('DOM加载完毕, 用时' + (new Date().getTime() - DOMLoadStartTime).toString() + 'ms');
    if (localStorage.getItem("dark") === 'true') {
        Jian.dark.set(true);
    } else if (localStorage.getItem("dark") === 'false') {
        Jian.dark.set(false);
    } else {
        Jian.dark.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    Jian.console.logo();
    Jian.onload.run();
    if (document.documentElement.offsetWidth > 672) {
        document.getElementsByClassName("menu")[0].style.display = "flex"
    } else {
        document.getElementsByClassName("menu")[0].style.display = "none"
    }
    Jian.loading(false)
    if (location.hash) {
        document.querySelector(decodeURIComponent(location.hash)).scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
    }
})

if (window.location.pathname[window.location.pathname.length - 1] !== '/' && window.location.pathname.split('/')[0].indexOf('.') === -1 && window.location.pathname !== '/') {
    history.pushState({}, '', window.location.pathname + '/');
}

window.addEventListener('resize', function () {
    if (document.documentElement.offsetWidth > 672) {
        document.getElementsByClassName("menu")[0].style.display = "flex"
    } else {
        document.getElementsByClassName("menu")[0].style.display = "none"
    }
})

window.matchMedia('(prefers-color-scheme: dark)').addEventListener("change", function () {
    Jian.dark.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
})

Jian.onload.add(() => {
    if (document.querySelector(".side .type-toc")) {
        let timer
        window.addEventListener("scroll", () => {
            clearTimeout(timer)
            timer = setTimeout(() => {
                let tocCard = document.querySelector(".side .type-toc").parentElement;
                let side = document.querySelector(".side");
                if (side.getBoundingClientRect().top < 84) {
                    tocCard.style.position = "absolute";
                    if ((side.getBoundingClientRect().height + side.getBoundingClientRect().top) > 84) {
                        tocCard.style.top = 84 - side.getBoundingClientRect().top + "px";
                    } else {
                        tocCard.style.top = side.getBoundingClientRect().height + 8 + "px";
                    }
                } else {
                    tocCard.style.top = 84 - side.getBoundingClientRect().top + "px";
                    tocCard.style.position = "unset";
                }
            }, 1000)
        })
    }
})
