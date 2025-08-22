import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bcrypt from 'bcryptjs';

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'gescourrier'
});

// Inscription
app.post('/api/register', async (req, res) => {
  const { firstName, lastName, email, role, password } = req.body;
  const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  if (users.length > 0) return res.status(400).json({ error: 'Email déjà utilisé' });
  const hash = await bcrypt.hash(password, 10);
  await db.query(
    'INSERT INTO users (firstName, lastName, email, role, password, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [firstName, lastName, email, role, hash, false, new Date()]
  );
  res.json({ success: true });
});

// Connexion
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  if (users.length === 0) return res.status(400).json({ error: 'Utilisateur non trouvé' });
  const user = users[0];
  if (!user.isActive) return res.status(403).json({ error: 'Compte désactivé' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Mot de passe incorrect' });
  res.json({ success: true, user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role } });
});

// Liste des utilisateurs
app.get('/api/users', async (req, res) => {
  const [users] = await db.query('SELECT id, firstName, lastName, email, role, isActive, createdAt FROM users');
  res.json(users);
});

// Mettre à jour un utilisateur (par l'admin)
app.put('/api/users/:id', async (req, res) => {
  const { firstName, lastName, email, role, isActive } = req.body;
  try {
    await db.query(
      'UPDATE users SET firstName=?, lastName=?, email=?, role=?, isActive=? WHERE id=?',
      [firstName, lastName, email, role, isActive, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur" });
  }
});

// Supprimer un utilisateur (par l'admin)
app.delete('/api/users/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur" });
  }
});

// Activer/désactiver un utilisateur (par l'admin)
app.patch('/api/users/:id/activate', async (req, res) => {
  const { isActive } = req.body;
  try {
    await db.query('UPDATE users SET isActive=? WHERE id=?', [isActive, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors du changement d'état du compte" });
  }
});

// Ajouter un courrier arrivée
app.post('/api/incoming-mails', async (req, res) => {
  const {
    arrivalDate,
    arrivalTime,
    arrivalNumber,
    signatureDate,
    signatureNumber,
    source,
    type,
    subject,
    attachment,
    attachmentName,
    receptionist,
    observations
  } = req.body;
  
  try {
    // Vérifier l'unicité du numéro d'arrivée pour l'année
    const year = new Date(arrivalDate).getFullYear();
    const [existingMails] = await db.query(
      'SELECT id FROM incoming_mails WHERE YEAR(arrivalDate) = ? AND arrivalNumber = ?',
      [year, arrivalNumber]
    );
    
    if (existingMails.length > 0) {
      return res.status(400).json({ 
        error: `Le numéro d'arrivée ${arrivalNumber} existe déjà pour l'année ${year}` 
      });
    }
    
    await db.query(
      `INSERT INTO incoming_mails 
        (arrivalDate, arrivalTime, arrivalNumber, signatureDate, signatureNumber, source, type, subject, attachment, attachmentName, receptionist, observations) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        arrivalDate,
        arrivalTime,
        arrivalNumber,
        signatureDate,
        signatureNumber,
        source,
        type,
        subject,
        attachment ? Buffer.from(attachment.split(',')[1], 'base64') : null,
        attachmentName,
        receptionist,
        observations
      ]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'ajout du courrier" });
  }
});

// Vérifier l'unicité du numéro d'arrivée pour une année donnée
app.get('/api/incoming-mails/check-unique', async (req, res) => {
  const { year, number, excludeId } = req.query;
  try {
    let query = 'SELECT id FROM incoming_mails WHERE YEAR(arrivalDate) = ? AND arrivalNumber = ?';
    let params = [year, number];
    
    // Si on exclut un ID (pour l'édition), on l'ajoute à la requête
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const [rows] = await db.query(query, params);
    res.json({ unique: rows.length === 0 });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la vérification d'unicité" });
  }
});

// Vérifier l'unicité du numéro de signature pour une année donnée
app.get('/api/outgoing-mails/check-unique', async (req, res) => {
  const { year, number, excludeId } = req.query;
  try {
    let query = 'SELECT id FROM outgoing_mails WHERE YEAR(signatureDate) = ? AND signatureNumber = ?';
    let params = [year, number];
    
    // Si on exclut un ID (pour l'édition), on l'ajoute à la requête
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const [rows] = await db.query(query, params);
    res.json({ unique: rows.length === 0 });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la vérification d'unicité" });
  }
});

// Liste des courriers arrivée
app.get('/api/incoming-mails', async (req, res) => {
  try {
    const [send] = await db.query(
      'SELECT id, arrivalDate, arrivalTime, arrivalNumber, signatureDate, signatureNumber, source, type, subject, attachmentName, (attachment IS NOT NULL) AS hasAttachment, receptionist, observations, createdAt FROM incoming_mails ORDER BY arrivalDate DESC'
    );
    res.json(send);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des courriers" });
  }
});

// Mettre à jour un courrier arrivée (par l'admin)
app.put('/api/incoming-mails/:id', async (req, res) => {
  const {
    arrivalDate,
    arrivalTime,
    arrivalNumber,
    signatureDate,
    signatureNumber,
    source,
    type,
    subject,
    attachment,
    attachmentName,
    receptionist,
    observations
  } = req.body;
  
  try {
    // Vérifier l'unicité du numéro d'arrivée pour l'année (en excluant le courrier actuel)
    const year = new Date(arrivalDate).getFullYear();
    const [existingMails] = await db.query(
      'SELECT id FROM incoming_mails WHERE YEAR(arrivalDate) = ? AND arrivalNumber = ? AND id != ?',
      [year, arrivalNumber, req.params.id]
    );
    
    if (existingMails.length > 0) {
      return res.status(400).json({ 
        error: `Le numéro d'arrivée ${arrivalNumber} existe déjà pour l'année ${year}` 
      });
    }
    
    await db.query(
      `UPDATE incoming_mails SET 
        arrivalDate=?, arrivalTime=?, arrivalNumber=?, signatureDate=?, signatureNumber=?, source=?, type=?, subject=?, attachment=?, attachmentName=?, receptionist=?, observations=? 
      WHERE id=?`,
      [
        arrivalDate,
        arrivalTime,
        arrivalNumber,
        signatureDate,
        signatureNumber,
        source,
        type,
        subject,
        attachment ? Buffer.from(attachment.split(',')[1], 'base64') : null,
        attachmentName,
        receptionist,
        observations,
        req.params.id
      ]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour du courrier arrivé" });
  }
});

// Supprimer un courrier arrivée (par l'admin)
app.delete('/api/incoming-mails/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM incoming_mails WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression du courrier" });
  }
});

//AFFECTATION

// Liste des affectations
app.get('/api/assignments', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM assignments');
    // Parse assignedTo JSON
    const assignments = rows.map(a => ({
      ...a,
      assignedTo: JSON.parse(a.assignedTo)
    }));
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des affectations" });
  }
});

// Créer une affectation
app.post('/api/assignments', async (req, res) => {
  const { mailId, assignedTo, assignedBy, comment, assignedAt, status } = req.body;
  try {
    await db.query(
      'INSERT INTO assignments (mailId, assignedTo, assignedBy, comment, assignedAt, status) VALUES (?, ?, ?, ?, ?, ?)',
      [mailId, JSON.stringify(assignedTo), assignedBy, comment, assignedAt, status || 'pending']
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la création de l'affectation" });
  }
});

// Mettre à jour une affectation (traitement)
app.put('/api/assignments/:id', async (req, res) => {
  const { status, processedAt, processedBy, processingComment, responseFile, responseFileName } = req.body;
  try {
    await db.query(
      'UPDATE assignments SET status=?, processedAt=?, processedBy=?, processingComment=?, responseFile=?, responseFileName=? WHERE id=?',
      [
        status,
        processedAt,
        processedBy,
        processingComment,
        responseFile ? Buffer.from(responseFile.split(',')[1], 'base64') : null,
        responseFileName,
        req.params.id
      ]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour de l'affectation" });
  }
});

// Réaffecter une affectation à d'autres utilisateurs
app.put('/api/assignments/:id/reassign', async (req, res) => {
  const { assignedTo, assignedBy, comment } = req.body;
  try {
    await db.query(
      'UPDATE assignments SET assignedTo=?, assignedBy=?, comment=?, assignedAt=?, status=?, processedAt=NULL, processedBy=NULL, processingComment=NULL, responseFile=NULL, responseFileName=NULL WHERE id=?',
      [
        JSON.stringify(Array.isArray(assignedTo) ? assignedTo : []),
        assignedBy,
        comment || null,
        new Date().toISOString(),
        'pending',
        req.params.id
      ]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la réaffectation" });
  }
});
//DEPART
// Ajouter un courrier départ
app.post('/api/outgoing-mails', async (req, res) => {
  const {
    signatureDate,
    signatureNumber,
    destination,
    subject,
    attachment,
    attachmentName,
    receptionist,
    transmissionDate,
    transmissionTime,
    transmissionNumber,
    observations,
  } = req.body;
  
  try {
    // Vérifier l'unicité du numéro de signature pour l'année
    const year = new Date(signatureDate).getFullYear();
    const [existingMails] = await db.query(
      'SELECT id FROM outgoing_mails WHERE YEAR(signatureDate) = ? AND signatureNumber = ?',
      [year, signatureNumber]
    );
    
    if (existingMails.length > 0) {
      return res.status(400).json({ 
        error: `Le numéro de signature ${signatureNumber} existe déjà pour l'année ${year}` 
      });
    }
    
    await db.query(
      `INSERT INTO outgoing_mails 
        (signatureDate, signatureNumber, destination, subject, attachment, attachmentName, receptionist, transmissionDate, transmissionTime, transmissionNumber, observations) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
    signatureDate,
    signatureNumber,
    destination,
    subject,
    attachment && typeof attachment === 'string' && attachment.includes(',') 
  ? Buffer.from(attachment.split(',')[1], 'base64') 
  : null,
    attachmentName,
    receptionist,
    transmissionDate,
    transmissionTime,
    transmissionNumber,
    observations,
      ]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'ajout du courrier départ" });
  }
});

// Liste des courriers départ
app.get('/api/outgoing-mails', async (req, res) => {
  try {
    const [mails] = await db.query(
      'SELECT id, signatureDate, signatureNumber, destination, subject, attachment, attachmentName, receptionist, transmissionDate, transmissionTime, transmissionNumber, observations, createdAt FROM outgoing_mails ORDER BY signatureDate DESC'
    );
    res.json(mails);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des courriers départ" });
  }
});

// Mettre à jour un courrier départ
app.put('/api/outgoing-mails/:id', async (req, res) => {
  const {
    signatureDate,
    signatureNumber,
    destination,
    subject,
    attachment,
    attachmentName,
    receptionist,
    transmissionDate,
    transmissionTime,
    transmissionNumber,
    observations,
  } = req.body;
  
  try {
    // Vérifier l'unicité du numéro de signature pour l'année (en excluant le courrier actuel)
    const year = new Date(signatureDate).getFullYear();
    const [existingMails] = await db.query(
      'SELECT id FROM outgoing_mails WHERE YEAR(signatureDate) = ? AND signatureNumber = ? AND id != ?',
      [year, signatureNumber, req.params.id]
    );
    
    if (existingMails.length > 0) {
      return res.status(400).json({ 
        error: `Le numéro de signature ${signatureNumber} existe déjà pour l'année ${year}` 
      });
    }
    
    await db.query(
      `UPDATE outgoing_mails SET 
    signatureDate=?, signatureNumber=?, destination=?, subject=?, attachment=?, attachmentName=?, receptionist=?, transmissionDate=?, transmissionTime=?, transmissionNumber=?, observations=? 
      WHERE id=?`,
      [
    signatureDate,
    signatureNumber,
    destination,
    subject,
    attachment && typeof attachment === 'string' && attachment.includes(',') 
  ? Buffer.from(attachment.split(',')[1], 'base64') 
  : null,
    attachmentName,
    receptionist,
    transmissionDate,
    transmissionTime,
    transmissionNumber,
    observations,
    req.params.id
      ]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ error: "Erreur lors de la mise à jour du courrier départ" });
  }
});

// Supprimer un courrier départ
app.delete('/api/outgoing-mails/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM outgoing_mails WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression du courrier départ" });
  }
});

app.get('/api/outgoing-mails/:id/attachment', async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await db.query('SELECT attachment, attachmentName FROM outgoing_mails WHERE id = ?', [id]);
    if (rows.length === 0 || !rows[0].attachment) {
      return res.status(404).send('Aucune pièce jointe');
    }
    const buffer = rows[0].attachment;
    const filename = rows[0].attachmentName || 'piece-jointe';
    res.setHeader('Content-Disposition', `attachment; filename=\"${filename}\"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(buffer);
  } catch (error) {
    res.status(500).send('Erreur lors du téléchargement de la pièce jointe');
  }
});

app.get('/api/incoming-mails/:id/attachment', async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await db.query('SELECT attachment, attachmentName FROM incoming_mails WHERE id = ?', [id]);
    if (rows.length === 0 || !rows[0].attachment) {
      return res.status(404).send('Aucune pièce jointe');
    }
    const buffer = rows[0].attachment;
    const filename = rows[0].attachmentName || 'piece-jointe';
    res.setHeader('Content-Disposition', `attachment; filename=\"${filename}\"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(buffer);
  } catch (error) {
    res.status(500).send('Erreur lors du téléchargement de la pièce jointe');
  }
});

app.listen(4000, () => console.log('API running on http://localhost:4000'));

