# Example

To publish and fetch a message from a MAM channel using the REST API.

```js
const fetch = require('node-fetch');

const API_ENDPOINT = 'https://mam-api.dag.sh';

const SEED = 'YOUR_SEED_HERE' // 81 Trytes;

const provider = "devnet";
const mode = "restricted";
const key = "ABCDEFG9ABCDEFG";

fetch(
    `${API_ENDPOINT}/v0/publish`,
    {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            provider,
            mode,
            key,
            seed: SEED,
            dataType: "json",
            data: {
                "a": "hello",
                "b": 2
            },
            tag: "MYMAM"
        })
    })
    .then((res) => {
        return res.json();
    }).then((publishResponse) => {
        if (publishResponse.success) {
            console.log("Publish Success");
            console.log("Published root", publishResponse.publishedRoot);
            console.log("Next index to publish", publishResponse.nextIndex);
            console.log("View on Tangle", `https://utils.iota.org/mam/${publishResponse.publishedRoot}/${mode}/${key}/${provider}`);

            fetch(
                `${API_ENDPOINT}/v0/fetch?provider=${provider}&mode=${mode}&key=${key}&root=${publishResponse.publishedRoot}&dataType=json`,
                {
                    method: "GET",
                    headers: {
                        'Accept': 'application/json'
                    }
                }).then((res) => {
                    return res.json();
                }).then((fetchResponse) => {
                    if (fetchResponse.success) {
                        console.log("Fetch Success");
                        console.log("Data", fetchResponse.data);
                    }
                })
                .catch((err) => console.error("Error during request", err))
        }
    })
    .catch((err) => console.error("Error during request", err));
```
