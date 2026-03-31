import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

def send_otp(to_email: str, otp_code: str):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_from = os.getenv("SMTP_FROM", "noreply@skillbridge.dev")
    
    if not smtp_host or not smtp_user or not smtp_password:
        print(f"SMTP credentials not found. Would have sent OTP {otp_code} to {to_email}")
        return

    msg = MIMEMultipart()
    msg['From'] = smtp_from
    msg['To'] = to_email
    msg['Subject'] = "SkillBridge - Verify your Work Email"

    body = f"Hello,\n\nPlease verify your company domain for SkillBridge.\n\nYour OTP code is: {otp_code}\n\nThis code expires in 10 minutes.\n\nThanks,\nSkillBridge Team"
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        text = msg.as_string()
        server.sendmail(smtp_from, to_email, text)
        server.quit()
        print(f"OTP {otp_code} sent to {to_email}")
    except Exception as e:
        print(f"Failed to send OTP email: {e}")
