import nodemailer from 'nodemailer'
import { env } from './env'

interface SendEmailPayload {
	to: string
	subject: string
	text?: string
	html?: string
}

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
	if (!transporter) {
		const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = env

		if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
			throw new Error(
				'SMTP configuration is incomplete. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.'
			)
		}

		transporter = nodemailer.createTransport({
			service: 'gmail',
			host: SMTP_HOST,
			port: Number(SMTP_PORT),
			secure: SMTP_SECURE === true,
			auth: {
				user: SMTP_USER,
				pass: SMTP_PASS
			}
		})
	}

	return transporter
}

const TRANSIENT_SMTP_ERRORS = new Set([
	'ECONNRESET',
	'ETIMEDOUT',
	'ECONNREFUSED',
	'ESOCKET'
])

function isTransientSmtpError(err: unknown): boolean {
	return (
		err !== null &&
		typeof err === 'object' &&
		'code' in err &&
		typeof (err as { code: unknown }).code === 'string' &&
		TRANSIENT_SMTP_ERRORS.has((err as { code: string }).code)
	)
}

export async function sendEmail({ to, subject, text, html }: SendEmailPayload) {
	if (!to) {
		throw new Error('Destination email address (to) is required')
	}

	if (env.NODE_ENV === 'test') {
		return
	}

	const transporterInstance = getTransporter()
	const from = process.env.SMTP_FROM ?? process.env.SMTP_USER

	if (!from) {
		throw new Error(
			'SMTP_FROM or SMTP_USER must be configured to send emails'
		)
	}

	const payload = { from, to, subject, text, html }
	const maxAttempts = 3

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		try {
			await transporterInstance.sendMail(payload)
			return
		} catch (err) {
			if (isTransientSmtpError(err) && attempt < maxAttempts - 1) {
				await new Promise((resolve) =>
					setTimeout(resolve, Math.pow(2, attempt) * 500)
				)
			} else {
				throw err
			}
		}
	}

	await transporterInstance.sendMail({
		from,
		to,
		subject,
		text,
		html
	})
}

export async function sendOtpEmail({
	to,
	otp,
	purpose
}: {
	to: string
	otp: string
	purpose: string
}) {
	await sendEmail({
		to,
		subject: `${purpose} verification code`,
		text: `Your verification code is ${otp}. This code will expire shortly.`
	})
}

export async function sendOrganizationInvitation({
	to,
	inviterName,
	organizationName,
	inviteUrl
}: {
	to: string
	inviterName: string
	organizationName: string
	inviteUrl: string
}) {
	const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're invited</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#18181b;padding:32px 40px;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">cukkr</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.8px;">You're invited</p>
              <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#18181b;line-height:1.3;">
                Join <span style="color:#2563eb;">${organizationName}</span>
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#52525b;line-height:1.6;">
                <strong style="color:#18181b;">${inviterName}</strong> has invited you to collaborate on <strong style="color:#18181b;">${organizationName}</strong>. Accept your invite to get started.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;background-color:#2563eb;">
                    <a href="${inviteUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:13px;color:#a1a1aa;">
                Or copy this link into your browser:<br/>
                <a href="${inviteUrl}" style="color:#2563eb;word-break:break-all;">${inviteUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #f4f4f5;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
                This invitation was sent to <strong>${to}</strong>. If you weren't expecting this, you can safely ignore this email.<br/>
                &copy; ${new Date().getFullYear()} Cukkr. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

	const text = `You're invited to join ${organizationName}\n\n${inviterName} has invited you to collaborate on ${organizationName}.\n\nAccept your invitation: ${inviteUrl}\n\nIf you weren't expecting this, you can safely ignore this email.`

	await sendEmail({
		to,
		subject: `${inviterName} invited you to join ${organizationName}`,
		html,
		text
	})
}

export async function sendAppointmentVerificationEmail({
	to,
	customerName,
	barbershopName,
	verifyUrl
}: {
	to: string
	customerName: string
	barbershopName: string
	verifyUrl: string
}) {
	const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Appointment</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="background-color:#18181b;padding:32px 40px;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">cukkr</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.8px;">Confirm Your Appointment</p>
              <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#18181b;line-height:1.3;">
                Hi, ${customerName}
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#52525b;line-height:1.6;">
                Please confirm your appointment at <strong style="color:#18181b;">${barbershopName}</strong> by clicking the button below. Your booking will only be processed after confirmation.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;background-color:#ffc81e;">
                    <a href="${verifyUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#18181b;text-decoration:none;border-radius:8px;">
                      Confirm Appointment
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:13px;color:#a1a1aa;">
                Or copy this link into your browser:<br/>
                <a href="${verifyUrl}" style="color:#2563eb;word-break:break-all;">${verifyUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #f4f4f5;margin:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 32px;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
                If you did not make this appointment, you can safely ignore this email.<br/>
                &copy; ${new Date().getFullYear()} Cukkr. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

	const text = `Confirm Your Appointment\n\nHi ${customerName},\n\nPlease confirm your appointment at ${barbershopName} by visiting the link below. Your booking will only be processed after confirmation.\n\n${verifyUrl}\n\nIf you did not make this appointment, you can safely ignore this email.`

	await sendEmail({
		to,
		subject: 'Confirm your appointment at ' + barbershopName,
		html,
		text
	})
}

export async function sendIdentityVerificationEmail({
	to,
	customerName,
	barbershopName,
	verifyUrl
}: {
	to: string
	customerName: string
	barbershopName: string
	verifyUrl: string
}) {
	const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Identity</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="background-color:#18181b;padding:32px 40px;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">cukkr</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.8px;">Identity Verification</p>
              <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#18181b;line-height:1.3;">
                Is this you, ${customerName}?
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#52525b;line-height:1.6;">
                Please confirm your identity for <strong style="color:#18181b;">${barbershopName}</strong> by clicking the button below. This helps us keep your booking history connected to your account.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;background-color:#ffc81e;">
                    <a href="${verifyUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#18181b;text-decoration:none;border-radius:8px;">
                      Verify My Identity
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:13px;color:#a1a1aa;">
                Or copy this link into your browser:<br/>
                <a href="${verifyUrl}" style="color:#2563eb;word-break:break-all;">${verifyUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #f4f4f5;margin:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 32px;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
                If this was not you, you can safely ignore this email.<br/>
                &copy; ${new Date().getFullYear()} Cukkr. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

	const text = `Verify Your Identity\n\nIs this you, ${customerName}?\n\nPlease confirm your identity for ${barbershopName} by visiting the link below. This helps us keep your booking history connected to your account.\n\n${verifyUrl}\n\nIf this was not you, you can safely ignore this email.`

	await sendEmail({
		to,
		subject: 'Verify your identity at ' + barbershopName,
		html,
		text
	})
}

export async function sendBookingAcceptedEmail({
	to,
	customerName,
	barbershopName,
	referenceNumber
}: {
	to: string
	customerName: string
	barbershopName: string
	referenceNumber: string
}) {
	const now = new Date().getFullYear()

	const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Accepted</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="background-color:#18181b;padding:32px 40px;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">cukkr</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#22c55e;text-transform:uppercase;letter-spacing:0.8px;">Booking Accepted</p>
              <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#18181b;line-height:1.3;">
                Hi, ${customerName}
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#52525b;line-height:1.6;">
                Great news! Your appointment at <strong style="color:#18181b;">${barbershopName}</strong> has been <strong style="color:#22c55e;">accepted</strong>.
              </p>
              <table cellpadding="0" cellspacing="0" width="100%" style="background-color:#f0fdf4;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:13px;color:#52525b;">Reference Number</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#18181b;letter-spacing:0.5px;">${referenceNumber}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:14px;color:#52525b;line-height:1.6;">
                Please arrive on time for your appointment. If you need to make any changes, contact the barbershop directly.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #f4f4f5;margin:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 32px;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
                This email was sent to <strong>${to}</strong>.<br/>
                &copy; ${now} Cukkr. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

	const text = `Booking Accepted\n\nHi ${customerName},\n\nGreat news! Your appointment at ${barbershopName} has been accepted.\n\nReference Number: ${referenceNumber}\n\nPlease arrive on time for your appointment. If you need to make any changes, contact the barbershop directly.`

	await sendEmail({
		to,
		subject: `Your appointment at ${barbershopName} has been accepted`,
		html,
		text
	})
}

export async function sendBookingDeclinedEmail({
	to,
	customerName,
	barbershopName,
	referenceNumber,
	reason
}: {
	to: string
	customerName: string
	barbershopName: string
	referenceNumber: string
	reason?: string | null
}) {
	const now = new Date().getFullYear()

	const reasonBlock = reason
		? `<table cellpadding="0" cellspacing="0" width="100%" style="background-color:#fef2f2;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
            <tr>
              <td>
                <p style="margin:0;font-size:13px;color:#52525b;">Reason</p>
                <p style="margin:4px 0 0;font-size:15px;color:#18181b;line-height:1.5;">${reason}</p>
              </td>
            </tr>
          </table>`
		: ''

	const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Declined</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="background-color:#18181b;padding:32px 40px;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">cukkr</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#ef4444;text-transform:uppercase;letter-spacing:0.8px;">Booking Declined</p>
              <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#18181b;line-height:1.3;">
                Hi, ${customerName}
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#52525b;line-height:1.6;">
                Unfortunately, your appointment at <strong style="color:#18181b;">${barbershopName}</strong> was <strong style="color:#ef4444;">declined</strong>.
              </p>
              <table cellpadding="0" cellspacing="0" width="100%" style="background-color:#f9f9f9;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:13px;color:#52525b;">Reference Number</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#18181b;letter-spacing:0.5px;">${referenceNumber}</p>
                  </td>
                </tr>
              </table>
              ${reasonBlock}
              <p style="margin:0;font-size:14px;color:#52525b;line-height:1.6;">
                You can book another appointment at a different time. Visit ${barbershopName.toLowerCase().replace(/\s+/g, '-')}'s booking page to try again.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #f4f4f5;margin:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 32px;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
                This email was sent to <strong>${to}</strong>.<br/>
                &copy; ${now} Cukkr. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

	const reasonText = reason ? `\nReason: ${reason}\n` : ''
	const text = `Booking Declined\n\nHi ${customerName},\n\nUnfortunately, your appointment at ${barbershopName} was declined.\n\nReference Number: ${referenceNumber}${reasonText}\nYou can book another appointment at a different time.`

	await sendEmail({
		to,
		subject: `Your appointment at ${barbershopName} was declined`,
		html,
		text
	})
}

export async function sendBookingExpiredEmail({
	to,
	customerName,
	barbershopName,
	referenceNumber
}: {
	to: string
	customerName: string
	barbershopName: string
	referenceNumber: string
}) {
	const now = new Date().getFullYear()

	const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Expired</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="background-color:#18181b;padding:32px 40px;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">cukkr</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#a16207;text-transform:uppercase;letter-spacing:0.8px;">Booking Expired</p>
              <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#18181b;line-height:1.3;">
                Hi, ${customerName}
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#52525b;line-height:1.6;">
                Your appointment at <strong style="color:#18181b;">${barbershopName}</strong> has <strong style="color:#a16207;">expired</strong> because it was not confirmed in time.
              </p>
              <table cellpadding="0" cellspacing="0" width="100%" style="background-color:#f9f9f9;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:13px;color:#52525b;">Reference Number</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#18181b;letter-spacing:0.5px;">${referenceNumber}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:14px;color:#52525b;line-height:1.6;">
                If you still need an appointment, please book a new time. Visit ${barbershopName.toLowerCase().replace(/\s+/g, '-')}'s booking page to try again.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #f4f4f5;margin:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 32px;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
                This email was sent to <strong>${to}</strong>.<br/>
                &copy; ${now} Cukkr. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

	const text = `Booking Expired\n\nHi ${customerName},\n\nYour appointment at ${barbershopName} has expired because it was not confirmed in time.\n\nReference Number: ${referenceNumber}\n\nIf you still need an appointment, please book a new time.`

	await sendEmail({
		to,
		subject: `Your appointment at ${barbershopName} has expired`,
		html,
		text
	})
}

export async function verifySmtp() {
	if (env.NODE_ENV === 'test') {
		return true
	}

	try {
		const transporterInstance = getTransporter()
		await transporterInstance.verify()
		return true
	} catch (error) {
		console.error('[SMTP Error] Failed to verify connection:', error)
		throw error
	}
}
