import { Observable } from "rxjs";

let output = document.getElementById("output");
let button = document.getElementById("button");

let click = Observable.fromEvent(button, "click");

function load(url: string) {
    return Observable.create(observer => {
        let xhr = new XMLHttpRequest();

        xhr.addEventListener("load", () => {
            if (xhr.status === 200) {
                let data = JSON.parse(xhr.responseText);
                observer.next(data);
                observer.complete();
            } else {
                observer.error(xhr.statusText);
            }
        });

        xhr.open("GET", url);
        xhr.send();
    }).retryWhen(retryStrategy({ attempts: 3, delay: 1500 }));
}

function loadWithFetch(url: string) {
    // only fetch when someone subscribes to the observable
    return Observable.defer(() => {
        return Observable.fromPromise(
            fetch(url).then(r => r.json())
        );
    });
}

function retryStrategy({ attempts = 4, delay = 1000 }) {
    return function (errors) {
        return errors
            .scan((acc, value) => {
                console.log(acc, value);
                return acc + 1;
            }, 0)
            .takeWhile(acc => acc < attempts)
            .delay(delay);
    }
}

function renderMovies(movies) {
    movies.forEach(m => {
        let div = document.createElement("div");
        div.innerText = m.title;
        output.appendChild(div);
    });
}

loadWithFetch("movies.json").subscribe(renderMovies);

click.flatMap(e => loadWithFetch("movies.json"))
    .subscribe(
    renderMovies,
    e => console.log(`error: ${e}`),
    () => console.log("complete")
);

let circle = document.getElementById('circle');
let mouseMoveSource = Observable.fromEvent(
    document,
    "mousemove"
).filter((e: MouseEvent) => {
    return e.clientX < 500
}).map((e: MouseEvent) => {
    return {
        x: e.clientX,
        y: e.clientY
    };
}).delay(200);

mouseMoveSource.subscribe(value => {
    circle.style.left = `${value.x}px`;
    circle.style.top = `${value.y}px`;

}, e => {
    console.log(`error: ${e}`);
}, () => {
    console.log('complete');
});







