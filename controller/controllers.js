const db = require('../config/db'); 
const bcrypt = require('bcrypt'); 

async function registerUser(name, email, password) {
    try {
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO user_table (name, email, password) VALUES (?, ?, ?)';
        const[result]= await db.execute(query, [name, email, hashedPassword]);
                
        console.log('Query executed')
        return result;
    } catch (err) {
        console.error('Error hashing password:', err.message);
        throw err; 
    }
}

async function findByEmail(email) {
    try {
        const query = `SELECT * FROM user_table WHERE email = ?`;
        const [rows] = await db.query(query, [email]);
        console.log("rows", rows);
        
        return rows[0]; 
    } catch (err) {
        throw err;
    }
}

async function findbyname(name) {
    try {
        const query = 'SELECT * FROM user_table WHERE name = ?';
        const [rows] = await db.query(query, [name]);
        console.log("Rows found in user_table:", rows);
        return rows[0]; 
    } catch (err) {
        console.error("Error in findbyname:", err.message);
        throw err; 
    }
}


async function createUserProfile(name,headline,location,company,education,experience,skills) {
    try{
        const query = `
        INSERT INTO profile (name, headline, location, company, education, experience, skills)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            headline = VALUES(headline), 
            location = VALUES(location), 
            company = VALUES(company), 
            education = VALUES(education), 
            experience = VALUES(experience),    
            skills = VALUES(skills)
    `;
        const [result]=await db.query(query,[name,headline,location,company,education,experience,skills])
        return result
    }catch(error){
        console.error("Error updating profile",error.message)
        throw err;
    }    
}
async function updatebyname(name){
    try{
        const query='SELECT * FROM profile WHERE name=?'
        const[rows]=await db.query(query,[name])
        console.log("Rows found in profile:", rows);
        return rows[0]; // Return the first match or undefined
    } catch (err) {
        console.error("Error in updatebyname:", err.message);
        throw err; // Propagate the error for the caller to handle
    }
}
async function updateprofile(name,headline,location,company,education,experience,skills) {
    try{
        const query = `
            UPDATE profile
            SET 
                headline = ?, 
                location = ?, 
                company = ?, 
                education = ?, 
                experience = ?, 
                skills = ?
            WHERE name = ?
    `;
        const[result]=await db.execute(query,[headline,location,company,education,experience,skills,name])
        return result
    }catch(error){
        console.error("Error updating",error.message)
    }
            
}

async function postHeadline(name) {
    try{
        const query='SELECT headline FROM profile WHERE name=?';
        const[rows]=await db.query(query,[name]);
        console,log("rws",rows)
    }catch(err){
        console.error("Error in fetching headline",err.message)
    }
    
}

async function postcreate(name, content,img) {
    try {
        const imgUrl = img || null; 
        const query = 'INSERT INTO posts (name, content, img, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())';
        const [result] = await db.execute(query, [name, content, imgUrl]);

        console.log("Post creation result:", result);
        return {
            post_id: result.insertId, 
            affectedRows: result.affectedRows, 
        };
    } catch (err) {
        console.error("Error in post creation:", err.message);
        throw err; 
    }
}

async function connect(user_name, connected_name) {
    try {
        const [user] = await db.query('SELECT user_id FROM user_table WHERE name = ?', [user_name]);
        if (user.length === 0) {
            throw new Error('User not found');
        }
        const user_id = user[0].user_id;

        const [connectedUser] = await db.query('SELECT user_id FROM user_table WHERE name = ?', [connected_name]);
        if (connectedUser.length === 0) {
            throw new Error('Connected user not found');
        }
        const connected_user_id = connectedUser[0].user_id;

        const [existingconnection] = await db.query(
            'SELECT status FROM connectionss WHERE user_id = ? AND connected_user_id = ?',
            [user_id, connected_user_id]
        );

        if (existingconnection.length > 0) {
            const existingstatus = existingconnection[0].status;
            if (existingstatus === 'pending') {
                const [resultS] = await db.query(
                    `INSERT INTO connectionss (user_id, connected_user_id, user_name, connected_name, status) VALUES (?, ?, ?, ?, 'accepted')`,
                    [user_id, connected_user_id, user_name, connected_name]
                );
                return resultS

            }
            if (existingstatus === 'pending' && existingstatus === 'accepted') {
                throw new Error(`Connection request is already in ${existingstatus} status.`);
                // const [resultS] = await db.query(
                //     `INSERT INTO connectionss (user_id, connected_user_id, user_name, connected_name, status) VALUES (?, ?, ?, ?, 'accepted')`,
                //     [user_id, connected_user_id, user_name, connected_name]
                // );
                // return resultS;
            }
            
        }

        const [result] = await db.query(
            `INSERT INTO connectionss (user_id, connected_user_id, user_name, connected_name, status) VALUES (?, ?, ?, ?, 'accepted')`,
            [user_id, connected_user_id, user_name, connected_name]
        );
        console.log(result);
        return result;
    } catch (err) {
        throw new Error(`Error creating connection: ${err.message}`);
    }
}

async function jobCreation( jobname, description, yearsofexp, skills, company, numberofpositions ){
    try{
        const[result]= await db.query(
            'INSERT INTO joblist( jobname, description, yearsofexp, skills, company, numberofpositions ) VALUES(?,?,?,?,?,?) ',[jobname, description, yearsofexp, skills, company, numberofpositions ]
        );
        console.log(result);
        return result
    }catch(err){
        throw new Error('Error creating job detail')
    }
}
  
async function resumeUpload(resume) {
    try {
        const uploadPath = `/uploads/resumes/${Date.now()}_${resume.name}`;
        await fs.promises.writeFile(uploadPath, resume.data, 'base64');
        return { path: uploadPath };
    } catch (err) {
        console.error("Resume upload failed:", err);
        return null;
    }
}

   





module.exports = {
    registerUser,findByEmail,createUserProfile,findbyname,updateprofile,updatebyname,postHeadline,postcreate,connect,jobCreation,resumeUpload
};
