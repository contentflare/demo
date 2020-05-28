
const fs = require('fs');
const util = require('util');
const http = require('http');
const https = require('https');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

(async () => {

	try {

		const pageUrl = process.env.DOMAIN;

		console.log(`Processing load CSS for ${pageUrl}`);

		if (pageUrl) {
			const baseUrl = /[^:\/]*:\/\/[^\/]*/.exec(pageUrl)[0];

			// load the page
			console.log(`Loading URL ${pageUrl}`);
			const content = await fetch(pageUrl);
			console.log(`Loading URL ${pageUrl}: DONE`);

			// extract the links
			console.log(`Parsing content`);
			const links = [];
			const cssLinkReg = /<link [^>]*rel=["']stylesheet['"][^>]*>/g;
			while ((match = cssLinkReg.exec(content)) !== null) {
				console.log(`	Found one CSS link`);
				const urlReg = /href=["']([^"']*)["']/g;
				const linkMatch = urlReg.exec(match[0]);
				let link = linkMatch && linkMatch[1];
				if (link) {
					console.log(`	CSS link is valid (${link})`);
					if (link.indexOf('/') == 0) {
						console.log(`	CSS link is not absolute (${link})`);
						link = baseUrl + link;
					}
					console.log(`	CSS link added (${link})`);
					links.push(link);
				}
			}
			console.log(`Parsing content: DONE`);

			// update links in the index.html
			console.log(`Injecting CSS links in the index.html`);
			const linksInsert = links
				.map(link => `<link href="${link}" rel="stylesheet">`)
				.join('');
			const indexContent = await readFile('./public/index.html', 'utf8');
			const newIndexContent = indexContent.replace('<!-- CSS HEADERS -->', linksInsert);
			await writeFile('./public/index.html', newIndexContent, 'utf8');
			console.log(`Injecting CSS links in the index.html: DONE`);
		}
	} catch (e) {
		// do nothing
		console.log(e);
	}

	process.exit(0);

})();



function fetch (url) {
	return new Promise((resolve, reject) => {
		const req = url.indexOf('https') == 0 ? https : http;
		req.get(url, (resp) => {
			let data = '';

			// A chunk of data has been recieved.
			resp.on('data', (chunk) => {
				data += chunk;
			});

			// The whole response has been received. Print out the result.
			resp.on('end', () => {
				resolve(data);
			});
		}).on("error", (err) => {
			reject(err);
		});
	});
}

