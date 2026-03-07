import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',  // Brevo SMTP host
    port: 587,                      // TLS port
    secure: false,                  // true if using port 465
    auth: {
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false,   
    }
    
});
// console.log("SMTP USER:", process.env.SMTP_USER);
// console.log("SMTP PASS:", process.env.SMTP_PASS);



export default transporter;
