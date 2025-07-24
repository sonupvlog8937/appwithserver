import nodemailer from 'nodemailer';

interface EmailOptions {
    email: string;
    subject: string;
    message: string;
}

const sendEmail = async (options: EmailOptions) => {
    // Create a transporter using SMTP settings from .env
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    } as nodemailer.TransportOptions); // Cast to TransportOptions to satisfy type checking

    // Define the email options
    const mailOptions = {
        from: `"${process.env.EMAIL_USER}" <${process.env.EMAIL_USER}>`, // Sender address
        to: options.email,
        subject: options.subject,
        html: options.message, // Use HTML for rich content
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};

export default sendEmail;