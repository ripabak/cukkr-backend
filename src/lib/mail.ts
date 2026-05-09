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
