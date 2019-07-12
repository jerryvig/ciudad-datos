// this is just a rudimentary http2 client example in TypeScript.
import * as http from 'http';
import * as zlib from 'zlib';

function main(): void {
    const request_options: http.RequestOptions = {
        protocol: 'http:',
        hostname: 'www.city-data.com',
        path: '/county/Clark_County-NV.html',
        headers: {
            'Accept-Encoding': 'gzip'
        }
    };

    http.get(request_options, (response: http.IncomingMessage) => {
        if (response.statusCode !== 200) {
            console.error(`Request failed with status code ${response.statusCode}.`);
            response.resume();
            return;
        }

        const gunzip: zlib.Gunzip = zlib.createGunzip();
        response.pipe(gunzip);

        let data: string = '';
        gunzip.on('data', (chunk: any) => {
            data += chunk.toString();
        });

        gunzip.on('end', () => {
            //console.log(data);


            // console.log('===== RESPONSE HEADERS ======');
            console.log(response.headers);
        });
    });
}

main();
