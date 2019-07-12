// this is just a rudimentary http2 client example in TypeScript.
import * as http from 'http';



function main(): void {
    const request_options: http.RequestOptions = {
        protocol: 'http:',
        hostname: 'www.city-data.com',
        path: '/county/Clark_County-NV.html',
        headers: {
            'Accept-Encoding': 'gzip'
        }
    };

    http.get(request_options, (response) => {
        const { statusCode } = response;

        if (statusCode !== 200) {
            console.error(`Request failed with status code ${statusCode}.`);
            response.resume();
            return;
        }

        let data: string = '';
        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            console.log(data);
            console.log('===== RESPONSE HEADERS ======');
            console.log(response.headers);
        });
    });
}

main();
