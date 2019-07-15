import * as fs from 'fs';
import * as http from 'http';
import * as zlib from 'zlib';

const COUNTY_FILE_PATH: fs.PathLike = 'data/county_list.csv';

interface County {
    name: string;
    state: string;
}

const county_list: County[] = [];

function get_county_page(county: County): void {
    const regex: RegExp = / /g;
    const county_name: string = county.name.replace(regex, '_');
    const path: string = `/county/${county_name}-${county.state}.html`;

    const request_options: http.RequestOptions = {
        protocol: 'http:',
        hostname: 'www.city-data.com',
        path: path,
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

        if (response.headers['content-encoding'] === 'gzip') {
            const gunzip: zlib.Gunzip = zlib.createGunzip();
            response.pipe(gunzip);

            let data: string = '';
            gunzip.on('data', (chunk: any) => {
                data += chunk.toString();
            });

            gunzip.on('end', () => {
                console.log('====== BODY CONTENT =====');
                console.log(data);

                console.log('===== RESPONSE HEADERS ======');
                console.log(response.headers);
            });
        }
    });
}

function main(args?: string[]): void {
    if (args === undefined || args.length < 3) {
        fs.readFile(COUNTY_FILE_PATH, (err, buffer: Buffer | string) => {
            if (err) {
                console.error(err);
                return;
            }

            const buffer_data: string[] = buffer.toString().split('\n');
            for (const line of buffer_data) {
                if (line) {
                    const fields: string[] = line.split(',');
                    county_list.push({name: fields[0], state: fields[1]});
                }
            }

            if (county_list.length > 0) {
                county_list.forEach((county: County, index: number) => {
                    setTimeout(get_county_page, 1000 * index, county);
                });
            }
        });
    }
}

main(process.argv);
