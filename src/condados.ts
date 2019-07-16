import * as cheerio from 'cheerio';
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
                // we need to process the body content here.
                const $: CheerioStatic = cheerio.load(data);

                const population_text: string = $('#population').text();
                const population_string: string = population_text.split(':')[1].split(' ')[1];
                const population: number = parseInt(population_string.replace(/,/g, ''));

                console.log('population = ' + population);

                const pop_density_lines: string[] = $('#population-density').text().split('\n');
                for (const line of pop_density_lines) {
                    if (line.startsWith('Land area:')) {
                        const land_area_string: string = line.split(' ')[2];
                        const land_area: number = parseInt(land_area_string);
                        console.log('land_area = ' + land_area);
                    }
                }

                console.log('==================================');
            });
        }
    });
}

function main(args?: string[]): void {
    if (args === undefined || args.length < 3) {
        fs.readFile(COUNTY_FILE_PATH, (err: NodeJS.ErrnoException | null, buffer: Buffer | string) => {
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
