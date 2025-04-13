import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sharp from 'sharp';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Create a connection pool to the MySQL database
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'reporting_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Make the uploads directory static and accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
}).single('file');

// Sample route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// POST route for form submissions
app.post('/api/report', (req, res) => {
    upload(req, res, async function(err) {
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        } else if (err) {
            console.error('Unknown error:', err);
            return res.status(400).json({ message: `Unknown error: ${err.message}` });
        }

        const { clientName, date, address, mobileNumber, description, service, location } = req.body;
        
        try {
            let fileData = null;
            let mimeType = null;

            if (req.file) {
                // Resize image before saving
                const buffer = await sharp(req.file.path)
                    .resize(800, 600, { // Adjust size as needed
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .toBuffer();

                // Convert to base64
                fileData = buffer.toString('base64');
                mimeType = req.file.mimetype;

                console.log('File processed:', {
                    originalSize: req.file.size,
                    newSize: buffer.length,
                    type: mimeType
                });

                // Clean up: remove the temporary file
                await fs.promises.unlink(req.file.path);
            }

            // Insert into database
            const [result] = await pool.query(
                'INSERT INTO list_report (client_name, address, `contact no.`, date, service_description, proof, proof_type, `nature of service`, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [clientName, address, mobileNumber, date, description, fileData, mimeType, service, location]
            );

            res.status(201).json({ 
                message: 'Form data saved successfully', 
                insertId: result.insertId 
            });
        } catch (error) {
            console.error('Database error:', error);
            res.status(400).json({ message: `Database error: ${error.message}` });
        }
    });
});

// Update the GET reports endpoint to use plumber_id
app.get('/api/reports', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT r.*, p.username as plumber_username,
                   CASE 
                       WHEN ar.report_id IS NOT NULL THEN 'completed'
                       WHEN r.status = 'working' AND ar.report_id IS NULL THEN 'working'
                       ELSE 'pending'
                   END as status
            FROM list_report r 
            LEFT JOIN PDA p ON r.plumber_id = p.id
            LEFT JOIN \`accomplish-report\` ar ON r.id = ar.report_id
        `);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(400).json({ message: 'Error fetching reports', error: error.message });
    }
});

// GET route to fetch report details by ID
app.get('/api/reports/:id', async (req, res) => {
    const reportId = parseInt(req.params.id, 10);
    try {
        const [rows] = await pool.query('SELECT * FROM list_report WHERE id = ?', [reportId]);
        
        if (rows.length > 0) {
            const report = rows[0];
            
            if (report.proof && report.proof_type) {
                try {
                    // Data should already be in base64 format
                    report.proof = `data:${report.proof_type};base64,${report.proof}`;
                    console.log('Image data prepared:', {
                        mimeType: report.proof_type,
                        dataLength: report.proof.length,
                        preview: report.proof.substring(0, 50) + '...'
                    });
                } catch (error) {
                    console.error('Error processing image:', error);
                    report.proof = null;
                }
            }

            res.status(200).json(report);
        } else {
            res.status(404).json({ message: 'Report not found' });
        }
    } catch (error) {
        console.error('Error fetching report details:', error);
        res.status(400).json({ message: 'Error fetching report details', error: error.message });
    }
});

// Update the approval endpoint to properly get plumber username
app.post('/api/report/:id/approve', async (req, res) => {
    const { id } = req.params;
    let connection;
    
    try {
        // Get a connection from the pool
        connection = await pool.getConnection();
        
        // Start transaction
        await connection.beginTransaction();

        // Get the report data with plumber username
        const [reportData] = await connection.query(`
            SELECT r.*, 
                   p.username as plumber_username,
                   p.id as plumber_id
            FROM list_report r
            LEFT JOIN PDA p ON r.plumber_id = p.id
            WHERE r.id = ?`, [id]);

        if (!reportData || reportData.length === 0) {
            throw new Error('Report not found');
        }

        const [accomplishedData] = await connection.query(
            'SELECT * FROM `accomplish-report` WHERE report_id = ?', 
            [id]
        );

        if (!accomplishedData || accomplishedData.length === 0) {
            throw new Error('Accomplished report data not found');
        }

        // Verify plumber data
        if (!reportData[0]?.plumber_id) {
            throw new Error('No plumber assigned to this report');
        }

        // Get plumber username directly from PDA table
        const [plumberData] = await connection.query(
            'SELECT username FROM PDA WHERE id = ? AND role = "plumber"',
            [reportData[0].plumber_id]
        );

        if (!plumberData[0]?.username) {
            throw new Error('Invalid plumber assignment');
        }

        const plumberUsername = plumberData[0].username;

        // Compress images if they exist
        let proof = reportData[0].proof;
        let accomplishProof = accomplishedData[0].accomplish_proof;

        if (proof && proof.length > 500000) { // If larger than 500KB
            try {
                const proofBuffer = Buffer.from(proof, 'base64');
                proof = await sharp(proofBuffer)
                    .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 60 })
                    .toBuffer()
                    .then(buffer => buffer.toString('base64'));
            } catch (err) {
                console.error('Error compressing proof image:', err);
            }
        }

        if (accomplishProof && accomplishProof.length > 500000) {
            try {
                const accomplishBuffer = Buffer.from(accomplishProof, 'base64');
                accomplishProof = await sharp(accomplishBuffer)
                    .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 60 })
                    .toBuffer()
                    .then(buffer => buffer.toString('base64'));
            } catch (err) {
                console.error('Error compressing accomplish proof image:', err);
            }
        }

        // Insert into approved_reports with compressed images
        await connection.query(`
            INSERT INTO approved_reports (
                client_name, date, address, contact_no, 
                service_description, nature_of_service, location,
                proof, departure_time, arrival_time, 
                accomplish_date, accomplish_proof, plumber_username
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            reportData[0].client_name,
            reportData[0].date,
            reportData[0].address,
            reportData[0]['contact no.'],
            reportData[0].service_description,
            reportData[0]['nature of service'],
            reportData[0].location,
            proof,
            accomplishedData[0].departure_time,
            accomplishedData[0].arrival_time,
            accomplishedData[0].accomplish_date,
            accomplishProof,
            plumberUsername
        ]);

        // Delete from list_report and accomplish-report
        await connection.query('DELETE FROM `accomplish-report` WHERE report_id = ?', [id]);
        await connection.query('DELETE FROM list_report WHERE id = ?', [id]);

        // Commit the transaction
        await connection.commit();
        
        res.json({ 
            message: 'Report approved and archived successfully',
            plumberUsername: plumberUsername
        });
    } catch (error) {
        console.error('Error in approval process:', error);
        
        // Rollback if we have a connection
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error('Error rolling back:', rollbackError);
            }
        }

        res.status(500).json({ 
            message: 'Error approving report', 
            error: error.message 
        });
    } finally {
        // Release the connection back to the pool
        if (connection) {
            connection.release();
        }
    }
});

// POST route for user login
app.post('/api/login', async (req, res) => {
    const { username, password, role } = req.body;
    console.log(`Login attempt with username: ${username}, password: ${password}, and role: ${role}`);
    try {
        const [rows] = await pool.query(
            'SELECT * FROM PDA WHERE username = ? AND password = ? AND role = ?',
            [username, password, role]
        );
        console.log(`Query result: ${JSON.stringify(rows)}`);
        if (rows.length > 0) {
            res.status(200).json({ message: 'Login successful', user: rows[0] });
        } else {
            res.status(401).json({ message: 'Invalid username, password, or role' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(400).json({ message: 'Error during login', error: error.message });
    }
});

// Add this new endpoint to get report by location
app.get('/api/reports/location/:lat/:lng', async (req, res) => {
    const { lat, lng } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM list_report WHERE location = ?', 
            [`${lat}, ${lng}`]
        );
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Report not found at this location' });
        }
    } catch (error) {
        console.error('Error fetching report by location:', error);
        res.status(400).json({ message: 'Error fetching report', error: error.message });
    }
});

// Update approved reports endpoint
app.get('/api/approved-reports', async (req, res) => {
    try {
        // First get all completed reports with their plumber info
        const [completedReports] = await pool.query(`
            SELECT lr.client_name, 
                   p.username as plumber_username
            FROM list_report lr
            JOIN PDA p ON lr.plumber_id = p.id
            WHERE p.role = 'plumber'
            AND lr.status = 'completed'
        `);

        // Create a map of client names to plumber usernames
        const plumberMap = {};
        completedReports.forEach(report => {
            plumberMap[report.client_name] = report.plumber_username;
        });

        // Get approved reports and add plumber info
        const [rows] = await pool.query(`
            SELECT * FROM approved_reports 
            ORDER BY date DESC
        `);
        
        // Process and add plumber username
        const processedRows = rows.map(row => ({
            ...row,
            plumber_username: plumberMap[row.client_name] || row.plumber_username,
            proof: row.proof ? row.proof.toString('base64') : null,
            accomplish_proof: row.accomplish_proof ? 
                (row.accomplish_proof.startsWith('data:') ? 
                    row.accomplish_proof : 
                    `data:image/jpeg;base64,${row.accomplish_proof.toString('base64')}`) 
                : null
        }));

        console.log('Processed Reports:', processedRows.map(row => ({
            id: row.id,
            client_name: row.client_name,
            plumber_username: row.plumber_username
        })));
        
        res.json(processedRows);
    } catch (error) {
        console.error('Error fetching approved reports:', error);
        res.status(500).json({ message: 'Failed to fetch approved reports' });
    }
});

// Add this near the start of your server.js, after creating the pool

// GET Username by User ID
app.get('/api/plumbers/:id/username', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT username FROM PDA WHERE id = ?', [id]);
        if (rows.length > 0) {
            res.status(200).json({ username: rows[0].username });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching username:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT Update Username and Password by User ID
app.put('/api/plumbers/:id', async (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE PDA SET username = ?, password = ? WHERE id = ?',
            [username, password, id]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Profile updated successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update the job acceptance endpoint to use plumber_id
app.post('/api/reports/:id/accept', async (req, res) => {
    const { id } = req.params;
    const { plumberId } = req.body;
    
    try {
        // Start transaction
        await pool.query('START TRANSACTION');

        // Check if report exists and isn't already assigned
        const [report] = await pool.query(
            'SELECT * FROM list_report WHERE id = ?',
            [id]
        );

        if (report.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Report not found' });
        }

        if (report[0].status === 'working') {
            await pool.query('ROLLBACK');
            return res.status(400).json({ message: 'Report already assigned' });
        }

        // Update the report status and assign plumber
        const [result] = await pool.query(
            'UPDATE list_report SET status = ?, plumber_id = ? WHERE id = ?',
            ['working', plumberId, id]
        );

        if (result.affectedRows === 0) {
            await pool.query('ROLLBACK');
            throw new Error('Failed to update report');
        }

        // Commit the transaction
        await pool.query('COMMIT');
        
        res.status(200).json({ message: 'Job accepted successfully' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error accepting job:', error);
        res.status(500).json({ 
            message: 'Failed to accept job',
            error: error.message
        });
    }
});

// Add this temporary route to check table structure

app.post('/api/reports/:id/accomplish', async (req, res) => {
    const { id } = req.params;
    const { 
        departureTime, 
        arrivalTime, 
        accomplishedDate, 
        proof
    } = req.body;

    try {
        await pool.query('START TRANSACTION');

        // Check if report exists and hasn't been completed yet
        const [reportCheck] = await pool.query(
            'SELECT * FROM list_report WHERE id = ? AND status != "completed"',
            [id]
        );

        if (reportCheck.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ 
                message: 'Report not found or already completed',
                reportId: id
            });
        }

        // Insert accomplishment report
        const [accomplishResult] = await pool.query(
            'INSERT INTO `accomplish-report` (report_id, departure_time, arrival_time, accomplish_date, accomplish_proof) VALUES (?, ?, ?, ?, ?)',
            [id, departureTime, arrivalTime, accomplishedDate, proof]
        );

        // Update report status to completed
        await pool.query(
            'UPDATE list_report SET status = "completed" WHERE id = ?',
            [id]
        );

        await pool.query('COMMIT');
        
        res.json({ 
            message: 'Report accomplished successfully',
            reportId: id,
            accomplishmentId: accomplishResult.insertId
        });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Server error:', error);
        res.status(500).json({ 
            message: 'Database error while submitting report',
            error: error.message
        });
    }
});

// Add this new endpoint to get accomplished report details
app.get('/api/reports/:id/accomplished', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM `accomplish-report` WHERE report_id = ?',
            [id]
        );
        
        if (rows.length > 0) {
            const accomplishedReport = rows[0];
            res.status(200).json(accomplishedReport);
        } else {
            res.status(404).json({ message: 'Accomplished report not found' });
        }
    } catch (error) {
        console.error('Error fetching accomplished report:', error);
        res.status(500).json({ 
            message: 'Failed to fetch accomplished report',
            error: error.message 
        });
    }
});

// Add new establishment location endpoint
app.post('/api/locations', async (req, res) => {
    const { location, location_name, type } = req.body;
    
    try {
        // Check if establishment with same name already exists
        const [existing] = await pool.query(
            'SELECT * FROM location WHERE location_name = ?',
            [location_name]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                message: 'An establishment with this name already exists'
            });
        }

        // Insert new establishment
        const [result] = await pool.query(
            'INSERT INTO location (location, location_name, type) VALUES (?, ?, ?)',
            [location, location_name, type]
        );

        res.status(201).json({ 
            message: 'Establishment added successfully',
            establishment: {
                id: result.insertId,
                name: location_name,
                location: location,
                type: type
            }
        });
    } catch (error) {
        console.error('Error adding establishment:', error);
        res.status(500).json({ 
            message: 'Failed to add establishment',
            error: error.message 
        });
    }
});

// Also add a GET endpoint to fetch all establishments
app.get('/api/locations', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM location');
        
        // Transform the data into the format needed by the frontend
        const locationMap = {};
        rows.forEach(loc => {
            const [lat, lng] = loc.location.split(',').map(coord => parseFloat(coord.trim()));
            locationMap[loc.location_name] = { 
                lat, 
                lng,
                type: loc.type
            };
        });

        res.status(200).json(locationMap);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ 
            message: 'Failed to fetch locations',
            error: error.message 
        });
    }
});

// Update the PUT endpoint for locations
app.put('/api/locations/:name', async (req, res) => {
    const { name } = req.params;
    const { location, location_name, type } = req.body;

    try {
        // First check if the establishment exists
        const [checkResult] = await pool.query(
            'SELECT * FROM location WHERE location_name = ?',
            [name]
        );

        if (checkResult.length === 0) {
            return res.status(404).json({ 
                message: 'Establishment not found'
            });
        }

        // Update the establishment
        const [result] = await pool.query(
            'UPDATE location SET location = ?, location_name = ?, type = ? WHERE location_name = ?',
            [location, location_name, type, name]
        );

        if (result.affectedRows === 0) {
            throw new Error('Failed to update establishment');
        }

        res.status(200).json({ 
            message: 'Establishment updated successfully',
            establishment: {
                name: location_name,
                location: location,
                type: type
            }
        });
    } catch (error) {
        console.error('Error updating establishment:', error);
        res.status(500).json({ 
            message: 'Failed to update establishment',
            error: error.message 
        });
    }
});

// Add DELETE endpoint for locations
app.delete('/api/locations/:name', async (req, res) => {
    const { name } = req.params;

    try {
        // First check if the establishment exists
        const [checkResult] = await pool.query(
            'SELECT * FROM location WHERE location_name = ?',
            [name]
        );

        if (checkResult.length === 0) {
            return res.status(404).json({ 
                message: 'Establishment not found'
            });
        }

        // Delete the establishment
        const [result] = await pool.query(
            'DELETE FROM location WHERE location_name = ?',
            [name]
        );

        if (result.affectedRows === 0) {
            throw new Error('Failed to delete establishment');
        }

        res.status(200).json({ 
            message: 'Establishment deleted successfully',
            name: name
        });
    } catch (error) {
        console.error('Error deleting establishment:', error);
        res.status(500).json({ 
            message: 'Failed to delete establishment',
            error: error.message 
        });
    }
});

// Add endpoint to fetch all coordinates
app.get('/api/coordinates', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM coordinates');
        
        // Transform into the format needed by the frontend
        const coordinatesMap = {};
        rows.forEach(coord => {
            coordinatesMap[coord.node_id] = [
                parseFloat(coord.latitude),
                parseFloat(coord.longitude)
            ];
        });

        res.status(200).json(coordinatesMap);
    } catch (error) {
        console.error('Error fetching coordinates:', error);
        res.status(500).json({ 
            message: 'Failed to fetch coordinates',
            error: error.message 
        });
    }
});

// Add endpoint to fetch graph structure
app.get('/api/graph', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM coordinates');
        
        // Helper function to calculate distance using Haversine formula
        const calculateDistance = (lat1, lng1, lat2, lng2) => {
            const R = 6371; // Earth's radius in km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLng = (lng2 - lng1) * Math.PI / 180;
            const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                Math.sin(dLng/2) * Math.sin(dLng/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        };

        // Create a map of node coordinates
        const nodeCoords = {};
        rows.forEach(node => {
            nodeCoords[node.node_id] = [
                parseFloat(node.latitude),
                parseFloat(node.longitude)
            ];
        });
        
        // Define graph connections structure
        const graphConnections = {
            // Main nodes (A1-A10)
            'A1': ['A2', 'A3', 'GCC'],
            'A2': ['B1', 'A1', 'A4'],
            'A3': ['A1', 'Paborito', 'A7', 'B10'],
            'A4': ['A2', 'A5', 'B6'],
            'A5': ['A4', 'A6', '7/11', 'LCC'],
            'A6': ['A5', 'A7'],
            'A7': ['A3', 'A8', 'A6', 'C4'],
            'A8': ['A7', 'A9', 'jolibee', 'Grace'],
            'A9': ['A8', 'Prime 1', 'Solid Metal', 'C9'],
            'A10': ['Prime 1', 'B6', 'LCC', 'D4'],

            // B nodes (B1-B10)
            'B1': ['Isang Cusina', 'B3', 'A2', 'B2'],
            'B2': ['B1', 'Paborito', 'C2'],
            'B3': ['B5', 'St Paul', 'B1'],
            'B4': ['St Paul', 'E2', 'B6', 'B7'],
            'B5': ['F10', 'B3'],
            'B6': ['B4', 'A4', 'A10', 'B8'],
            'B7': ['B9', 'B4', 'Central'],
            'B8': ['Central', 'B6', 'D4', 'D7'],
            'B9': ['G1', 'B7'],
            'B10': ['A3', 'C4', 'C1'],

            // C nodes (C1-C10)
            'C1': ['C2', 'C3', 'B10'],
            'C2': ['B2', 'C1'],
            'C3': ['C1'],
            'C4': ['A7', 'B10', 'C6', 'C5'],
            'C5': ['C4', 'Doña', 'C7', 'C9'],
            'C6': ['C4', 'C7'],
            'C7': ['C5', 'C6', 'C8'],
            'C8': ['C7', 'H1'],
            'C9': ['C5', 'C10', 'A9'],
            'C10': ['C9', '101', 'D3'],

            // D nodes (D1-D10)
            'D1': ['101', 'Solid Metal', 'D2', 'D4'],
            'D2': ['D5', 'D1', 'D3'],
            'D3': ['C10', 'D2', 'G10'],
            'D4': ['A10', 'B8', 'Motortrade', 'D1'],
            'D5': ['Motortrade', 'D6', 'D2'],
            'D6': ['D5', 'D7'],
            'D7': ['D6', 'D8', 'B8'],
            'D8': ['D7', 'D9', 'G4'],
            'D9': ['D8', 'D10', 'G3'],
            'D10': ['D9', 'E1'],

            // E nodes (E1-E10)
            'E1': ['D10', 'E2', 'G1', 'PSU', 'p1'],
            'E2': ['F9', 'E1', 'B4'],
            'E3': ['F5', 'F10', 'F9'],
            'E4': ['E5', 'F5', 'E7'],
            'E5': ['E4', 'E6'],
            'E6': ['E5', 'E7', 'E8'],
            'E7': ['E4', 'E6', 'E9'],
            'E8': ['E6', 'E9', 'E10'],
            'E9': ['E7', 'E8', 'F1'],
            'E10': ['E8', 'F1', 'F2'],

            // F nodes (F1-F10)
            'F1': ['E10', 'E9', 'F3'],
            'F2': ['E10', 'F3'],
            'F3': ['F2', 'F1', '7-Eleven'],
            'F5': ['E4', 'E3'],
            'F9': ['E2', 'E3'],
            'F10': ['E3', 'B5'],

            // G nodes (G1-G10)
            'G1': ['E1', 'B9', 'G2'],
            'G2': ['G1'],
            'G3': ['D9'],
            'G4': ['D8', 'G5'],
            'G5': ['G4', 'G6'],
            'G6': ['G5', 'G7'],
            'G7': ['G6', 'G8'],
            'G8': ['G7', 'G9'],
            'G9': ['G8', 'G10'],
            'G10': ['D3', 'G9'],

            // H node
            'H1': ['C8'],
            'p1': ['E1', 'PSU'],

            // Landmarks and establishments
            'GCC': ['A1', 'Paborito'],
            'LCC': ['A5', 'A10'],
            'Paborito': ['B2', 'A3', 'GCC'],
            'Grace': ['A8', 'Doña'],
            'Doña': ['Grace', 'C5'],
            'Prime 1': ['A9', 'A10'],
            'Isang Cusina': ['B1'],
            'jolibee': ['A8', '7/11'],
            '7/11': ['jolibee', 'A5'],
            'St Paul': ['B3', 'B4'],
            'Central': ['B8', 'B7'],
            'Solid Metal': ['D1', 'A9'],
            '101': ['D1', 'C10'],
            'Motortrade': ['D5', 'D4'],
            'PSU': ['p1', 'E1', '7-Eleven'],
            '7-Eleven': ['PSU', 'F3']
        };
        
        // Create graph structure with actual distances
        const graph = {};
            
            // Helper function to add connection with distance
        const addConnection = (from, to, connections) => {
                if (nodeCoords[from] && nodeCoords[to]) {
                    connections[to] = calculateDistance(...nodeCoords[from], ...nodeCoords[to]);
                }
            };

        // Build the graph with distances
        Object.entries(graphConnections).forEach(([node, connections]) => {
            graph[node] = {};
            connections.forEach(connectedNode => {
                addConnection(node, connectedNode, graph[node]);
            });
        });

        // Make connections bidirectional
        Object.entries(graph).forEach(([from, connections]) => {
            Object.entries(connections).forEach(([to, distance]) => {
                if (!graph[to]) {
                    graph[to] = {};
                }
                graph[to][from] = distance;
            });
        });

        res.status(200).json(graph);
    } catch (error) {
        console.error('Error fetching graph:', error);
        res.status(500).json({ 
            message: 'Failed to fetch graph',
            error: error.message 
        });
    }
});

// Add test endpoint to verify coordinates data
app.get('/api/test-coordinates', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM coordinates');
        console.log('Raw coordinates data:', rows);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error testing coordinates:', error);
        res.status(500).json({ 
            message: 'Failed to test coordinates',
            error: error.message 
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Connected to MySQL database`);
});
