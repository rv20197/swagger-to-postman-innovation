const express = require('express');
const Converter = require('openapi-to-postmanv2');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 3000;

// Define storage for file uploads
const upload = multer({ dest: 'uploads/' });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Define REST API endpoint for generating Postman collection
app.post(
	'/generate-postman-collection',
	upload.single('swaggerFile'),
	async (req, res) => {
		try {
			// Extract Swagger file and output directory from the request body
			const swaggerFile = req.file;
			const outputDir = req.body.outputDir;

			const swaggerData = fs.readFileSync(swaggerFile.path, {
				encoding: 'UTF8'
			});

			const options = {
				// Options for the conversion process
			};

			const swaggerSpec = {
				// Your Swagger specification
				type: 'string',
				data: JSON.parse(swaggerData)
			};

			// Generate the Postman collection based on the Swagger file contents
			Converter.convert(swaggerSpec, options, (err, collection) => {
				if (err) {
					throw new Error(err);
				} else {
					const postManCollection = JSON.stringify(collection.output[0].data);
					fs.writeFileSync(
						`${outputDir}/${swaggerFile.originalname}`,
						postManCollection
					);
				}
			});

			res.send('Postman collection generated successfully');
		} catch (error) {
			console.error('Error generating Postman collection:', error);
			res.status(500).send('Error generating Postman collection');
		}
	}
);

// Start the server
app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
