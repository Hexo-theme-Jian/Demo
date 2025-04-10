Jian.onload.add(function () {
    window.addEventListener('popstate', function (event) {
        Jian.plugins.read(false)
        Jian.loading(true)
        DOMLoadStartTime = new Date().getTime()
        fetch(window.location.href).then(res => res.text()).then((text) => {
            let newPageDoc = new DOMParser().parseFromString(text, "text/html");
            if (newPageDoc.body.classList.contains("no-sr")) {
                location.reload();
            }
            console.clear();
            document.querySelector("main.main.page-main").innerHTML = newPageDoc.querySelector("main.main.page-main").innerHTML;
            document.title = newPageDoc.title;
            Jian.console.info("DOM加载完毕, 用时" + ((new Date).getTime() - DOMLoadStartTime).toString() + "ms"),
                "true" === localStorage.getItem("dark") ? Jian.dark.set(!0) : "false" === localStorage.getItem("dark") ? Jian.dark.set(!1) : Jian.dark.set(window.matchMedia("(prefers-color-scheme: dark)").matches),
                Jian.console.logo();
            Jian.onload.state = false;
            Jian.onload.run();
            for (srsc of document.querySelector("main.main.page-main").querySelectorAll("script[sr]")) {
                try {
                    eval(srsc.innerHTML)
                } catch { }
            }
            Jian.onload.add(Jian.loading, false)
        }).catch(() => {
            location.reload();
        })
    });
    document.querySelectorAll("a[href]").forEach((url) => {
        if (new URL(url.href, window.location.origin).origin === window.location.origin && window.location.pathname !== new URL(url.href, window.location.origin).pathname) {
            url.onclick = (e) => {
                Jian.plugins.read(false)
                Jian.loading(true)
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                }
                DOMLoadStartTime = new Date().getTime()
                fetch(url.href).then(res => res.text()).then((text) => {
                    let newPageDoc = new DOMParser().parseFromString(text, "text/html");
                    if (newPageDoc.body.classList.contains("no-sr")) {
                        window.location.href = url.href
                    }
                    console.clear();
                    document.querySelector("main.main.page-main").innerHTML = newPageDoc.querySelector("main.main.page-main").innerHTML;
                    document.title = newPageDoc.title;
                    history.pushState({ url: url.href, title: document.title }, document.title, url.href)
                    Jian.console.info("DOM加载完毕, 用时" + ((new Date).getTime() - DOMLoadStartTime).toString() + "ms"),
                        "true" === localStorage.getItem("dark") ? Jian.dark.set(!0) : "false" === localStorage.getItem("dark") ? Jian.dark.set(!1) : Jian.dark.set(window.matchMedia("(prefers-color-scheme: dark)").matches),
                        Jian.console.logo();
                    Jian.onload.state = false;
                    Jian.onload.run();
                    for (srsc of document.querySelector("main.main.page-main").querySelectorAll("script[sr]")) {
                        try {
                            eval(srsc.innerHTML)
                        } catch { }
                    }
                    Jian.onload.add(Jian.loading, false)
                }).catch(() => {
                    window.location.href = url.href
                })
            }
        } else if (window.location.pathname === new URL(url.href, window.location.origin).pathname) {
            url.onclick = (e) => {
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                }
                Jian.loading(false)
                document.querySelector(decodeURIComponent(new URL(url.href, window.location.origin).hash)).scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
            }
        }
    })
})
