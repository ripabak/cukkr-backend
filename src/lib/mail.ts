import nodemailer from 'nodemailer'
import { env } from './env'
import { t, type Language } from './i18n'

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
	purpose,
	language = 'id'
}: {
	to: string
	otp: string
	purpose: string
	language?: Language
}) {
	await sendEmail({
		to,
		subject: t(language, 'email.otp.subject', { purpose }),
		text: t(language, 'email.otp.text', { otp })
	})
}

export async function sendOrganizationInvitation({
	to,
	inviterName,
	organizationName,
	inviteUrl,
	language = 'id'
}: {
	to: string
	inviterName: string
	organizationName: string
	inviteUrl: string
	language?: Language
}) {
	const year = new Date().getFullYear()
	const html = `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${t(language, 'email.invitation.title')}</title>
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
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.8px;">${t(language, 'email.invitation.title')}</p>
              <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#18181b;line-height:1.3;">
                ${t(language, 'email.invitation.heading', { organizationName })}
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#52525b;line-height:1.6;">
                ${t(language, 'email.invitation.body', { inviterName, organizationName })}
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;background-color:#2563eb;">
                    <a href="${inviteUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                      ${t(language, 'email.invitation.cta')}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:13px;color:#a1a1aa;">
                ${t(language, 'email.invitation.linkHint')}<br/>
                <a href="${inviteUrl}" style="color:#2563eb;word-break:break-all;">${inviteUrl}</a>
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
                ${t(language, 'email.invitation.footer', { to, year: String(year) })}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

	const text = t(language, 'email.invitation.text', {
		organizationName,
		inviterName,
		inviteUrl
	})

	await sendEmail({
		to,
		subject: t(language, 'email.invitation.subject', {
			inviterName,
			organizationName
		}),
		html,
		text
	})
}

export async function sendAppointmentVerificationEmail({
	to,
	customerName,
	barbershopName,
	verifyUrl,
	language = 'id'
}: {
	to: string
	customerName: string
	barbershopName: string
	verifyUrl: string
	language?: Language
}) {
	const year = new Date().getFullYear()
	const html = `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${t(language, 'email.appointmentVerification.title')}</title>
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
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.8px;">${t(language, 'email.appointmentVerification.title')}</p>
              <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#18181b;line-height:1.3;">
                ${t(language, 'email.appointmentVerification.heading', { customerName })}
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#52525b;line-height:1.6;">
                ${t(language, 'email.appointmentVerification.body', { barbershopName })}
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;background-color:#ffc81e;">
                    <a href="${verifyUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#18181b;text-decoration:none;border-radius:8px;">
                      ${t(language, 'email.appointmentVerification.cta')}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:13px;color:#a1a1aa;">
                ${t(language, 'email.appointmentVerification.linkHint')}<br/>
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
                ${t(language, 'email.appointmentVerification.footer', { year: String(year) })}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

	const text = t(language, 'email.appointmentVerification.text', {
		customerName,
		barbershopName,
		verifyUrl
	})

	await sendEmail({
		to,
		subject: t(language, 'email.appointmentVerification.subject', {
			barbershopName
		}),
		html,
		text
	})
}

export async function sendIdentityVerificationEmail({
	to,
	customerName,
	barbershopName,
	verifyUrl,
	language = 'id'
}: {
	to: string
	customerName: string
	barbershopName: string
	verifyUrl: string
	language?: Language
}) {
	const year = new Date().getFullYear()
	const html = `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${t(language, 'email.identityVerification.title')}</title>
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
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.8px;">${t(language, 'email.identityVerification.title')}</p>
              <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#18181b;line-height:1.3;">
                ${t(language, 'email.identityVerification.heading', { customerName })}
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#52525b;line-height:1.6;">
                ${t(language, 'email.identityVerification.body', { barbershopName })}
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;background-color:#ffc81e;">
                    <a href="${verifyUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#18181b;text-decoration:none;border-radius:8px;">
                      ${t(language, 'email.identityVerification.cta')}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:13px;color:#a1a1aa;">
                ${t(language, 'email.identityVerification.linkHint')}<br/>
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
                ${t(language, 'email.identityVerification.footer', { year: String(year) })}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

	const text = t(language, 'email.identityVerification.text', {
		customerName,
		barbershopName,
		verifyUrl
	})

	await sendEmail({
		to,
		subject: t(language, 'email.identityVerification.subject', {
			barbershopName
		}),
		html,
		text
	})
}

interface BookingDetailServiceItem {
	name: string
	price: number
	duration: number
}

function formatBookingDate(
	dateStr: string | null,
	language: Language
): string | null {
	if (!dateStr) return null
	const date = new Date(dateStr)
	const locale = language === 'id' ? 'id-ID' : 'en-US'
	return date.toLocaleDateString(locale, {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})
}

function renderBookingDetailsHtml(
	services: BookingDetailServiceItem[],
	scheduledAt: string | null,
	barberName: string | null,
	totalDuration: number,
	language: Language
): string {
	const locale = language === 'id' ? 'id-ID' : 'en-US'
	const fmtPrice = (p: number) => p.toLocaleString(locale)

	const scheduleStr = formatBookingDate(scheduledAt, language)

	const serviceRows = services
		.map(
			(s) => `
        <tr>
          <td style="padding:8px 0;font-size:14px;color:#18181b;border-bottom:1px solid #f4f4f5;">${s.name}</td>
          <td style="padding:8px 0;font-size:14px;color:#52525b;border-bottom:1px solid #f4f4f5;text-align:right;white-space:nowrap;">${fmtPrice(s.price)}</td>
          <td style="padding:8px 0;font-size:14px;color:#52525b;border-bottom:1px solid #f4f4f5;text-align:right;white-space:nowrap;">${s.duration} ${t(language, 'email.bookingAccepted.minuteUnit')}</td>
        </tr>`
		)
		.join('')

	const barberRow = barberName
		? `
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#52525b;">${t(language, 'email.bookingAccepted.barberLabel')}</td>
          <td style="padding:8px 0;font-size:14px;color:#18181b;text-align:right;" colspan="2">${barberName}</td>
        </tr>`
		: ''

	const scheduleRow = scheduleStr
		? `
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#52525b;">${t(language, 'email.bookingAccepted.scheduleLabel')}</td>
          <td style="padding:8px 0;font-size:14px;color:#18181b;text-align:right;" colspan="2">${scheduleStr}</td>
        </tr>`
		: ''

	return `
    <table cellpadding="0" cellspacing="0" width="100%" style="background-color:#f9f9f9;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
      <tr>
        <td>
          <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.8px;">${t(language, 'email.bookingAccepted.servicesLabel')}</p>
          <table cellpadding="0" cellspacing="0" width="100%">
            <thead>
              <tr>
                <th style="padding:4px 0 8px;font-size:11px;font-weight:600;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.5px;text-align:left;border-bottom:1px solid #e4e4e7;">${t(language, 'email.bookingAccepted.serviceLabel')}</th>
                <th style="padding:4px 0 8px;font-size:11px;font-weight:600;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.5px;text-align:right;border-bottom:1px solid #e4e4e7;">${t(language, 'email.bookingAccepted.priceLabel')}</th>
                <th style="padding:4px 0 8px;font-size:11px;font-weight:600;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.5px;text-align:right;border-bottom:1px solid #e4e4e7;">${t(language, 'email.bookingAccepted.durationLabel')}</th>
              </tr>
            </thead>
            <tbody>
              ${serviceRows}
              <tr>
                <td style="padding:12px 0 0;font-size:13px;font-weight:600;color:#52525b;">${t(language, 'email.bookingAccepted.totalDurationLabel')}</td>
                <td style="padding:12px 0 0;text-align:right;" colspan="2">
                  <span style="font-size:14px;font-weight:700;color:#18181b;">${totalDuration} ${t(language, 'email.bookingAccepted.minuteUnit')}</span>
                </td>
              </tr>
            </tbody>
          </table>
          ${
				barberRow || scheduleRow
					? `
          <table cellpadding="0" cellspacing="0" width="100%" style="margin-top:12px;border-top:1px solid #e4e4e7;padding-top:8px;">
            ${barberRow}
            ${scheduleRow}
          </table>`
					: ''
			}
        </td>
      </tr>
    </table>`
}

export async function sendBookingAcceptedEmail({
	to,
	customerName,
	barbershopName,
	referenceNumber,
	services,
	scheduledAt,
	barberName,
	totalDuration,
	language = 'id'
}: {
	to: string
	customerName: string
	barbershopName: string
	referenceNumber: string
	services: BookingDetailServiceItem[]
	scheduledAt: string | null
	barberName: string | null
	totalDuration: number
	language?: Language
}) {
	const year = new Date().getFullYear()
	const bookingDetailsHtml = renderBookingDetailsHtml(
		services,
		scheduledAt,
		barberName,
		totalDuration,
		language
	)
	const html = `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${t(language, 'email.bookingAccepted.title')}</title>
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
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#22c55e;text-transform:uppercase;letter-spacing:0.8px;">${t(language, 'email.bookingAccepted.title')}</p>
              <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#18181b;line-height:1.3;">
                ${t(language, 'email.bookingAccepted.heading', { customerName })}
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#52525b;line-height:1.6;">
                ${t(language, 'email.bookingAccepted.body', { barbershopName })}
              </p>
              <table cellpadding="0" cellspacing="0" width="100%" style="background-color:#f0fdf4;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:13px;color:#52525b;">${t(language, 'email.bookingAccepted.referenceLabel')}</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#18181b;letter-spacing:0.5px;">${referenceNumber}</p>
                  </td>
                </tr>
              </table>
              ${bookingDetailsHtml}
              <p style="margin:0;font-size:14px;color:#52525b;line-height:1.6;">
                ${t(language, 'email.bookingAccepted.bodyExtra')}
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
                ${t(language, 'email.bookingAccepted.footer', { to, year: String(year) })}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

	const acceptedServiceLines = services
		.map(
			(s) =>
				`${s.name} - ${s.price.toLocaleString()} - ${s.duration} ${t(language, 'email.bookingAccepted.minuteUnit')}`
		)
		.join('\n')
	const acceptedScheduleText = scheduledAt
		? `\n${t(language, 'email.bookingAccepted.scheduleLabel')}: ${formatBookingDate(scheduledAt, language)}`
		: ''
	const acceptedBarberText = barberName
		? `\n${t(language, 'email.bookingAccepted.barberLabel')}: ${barberName}`
		: ''
	const acceptedDurationText = `\n${t(language, 'email.bookingAccepted.totalDurationLabel')}: ${totalDuration} ${t(language, 'email.bookingAccepted.minuteUnit')}`

	const text = `${t(language, 'email.bookingAccepted.text', {
		customerName,
		barbershopName,
		referenceNumber
	})}
${t(language, 'email.bookingAccepted.servicesLabel')}:
${acceptedServiceLines}
${acceptedScheduleText}${acceptedBarberText}${acceptedDurationText}`

	await sendEmail({
		to,
		subject: t(language, 'email.bookingAccepted.subject', {
			barbershopName
		}),
		html,
		text
	})
}

export async function sendBookingDeclinedEmail({
	to,
	customerName,
	barbershopName,
	referenceNumber,
	services,
	scheduledAt,
	barberName,
	totalDuration,
	reason,
	language = 'id'
}: {
	to: string
	customerName: string
	barbershopName: string
	referenceNumber: string
	services: BookingDetailServiceItem[]
	scheduledAt: string | null
	barberName: string | null
	totalDuration: number
	reason?: string | null
	language?: Language
}) {
	const year = new Date().getFullYear()

	const bookingDetailsHtml = renderBookingDetailsHtml(
		services,
		scheduledAt,
		barberName,
		totalDuration,
		language
	)

	const reasonBlock = reason
		? `<table cellpadding="0" cellspacing="0" width="100%" style="background-color:#fef2f2;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
            <tr>
              <td>
                <p style="margin:0;font-size:13px;color:#52525b;">${t(language, 'email.bookingDeclined.reasonLabel')}</p>
                <p style="margin:4px 0 0;font-size:15px;color:#18181b;line-height:1.5;">${reason}</p>
              </td>
            </tr>
          </table>`
		: ''

	const html = `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${t(language, 'email.bookingDeclined.title')}</title>
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
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#ef4444;text-transform:uppercase;letter-spacing:0.8px;">${t(language, 'email.bookingDeclined.title')}</p>
              <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#18181b;line-height:1.3;">
                ${t(language, 'email.bookingDeclined.heading', { customerName })}
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#52525b;line-height:1.6;">
                ${t(language, 'email.bookingDeclined.body', { barbershopName })}
              </p>
              <table cellpadding="0" cellspacing="0" width="100%" style="background-color:#f9f9f9;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:13px;color:#52525b;">${t(language, 'email.bookingDeclined.referenceLabel')}</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#18181b;letter-spacing:0.5px;">${referenceNumber}</p>
                  </td>
                </tr>
              </table>
              ${bookingDetailsHtml}
              ${reasonBlock}
              <p style="margin:0;font-size:14px;color:#52525b;line-height:1.6;">
                ${t(language, 'email.bookingDeclined.bodyExtra')}
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
                ${t(language, 'email.bookingDeclined.footer', { to, year: String(year) })}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

	const reasonText = reason
		? `\n${t(language, 'email.bookingDeclined.reasonLabel')}: ${reason}\n`
		: ''

	const serviceLines = services
		.map(
			(s) =>
				`${s.name} - ${s.price.toLocaleString()} - ${s.duration} ${t(language, 'email.bookingDeclined.minuteUnit')}`
		)
		.join('\n')
	const scheduleText = scheduledAt
		? `\n${t(language, 'email.bookingDeclined.scheduleLabel')}: ${formatBookingDate(scheduledAt, language)}`
		: ''
	const barberText = barberName
		? `\n${t(language, 'email.bookingDeclined.barberLabel')}: ${barberName}`
		: ''
	const durationText = `\n${t(language, 'email.bookingDeclined.totalDurationLabel')}: ${totalDuration} ${t(language, 'email.bookingDeclined.minuteUnit')}`

	const text = `${t(language, 'email.bookingDeclined.text', {
		customerName,
		barbershopName,
		referenceNumber,
		reasonText
	})}
${t(language, 'email.bookingDeclined.servicesLabel')}:
${serviceLines}
${scheduleText}${barberText}${durationText}`

	await sendEmail({
		to,
		subject: t(language, 'email.bookingDeclined.subject', {
			barbershopName
		}),
		html,
		text
	})
}

export async function sendBookingExpiredEmail({
	to,
	customerName,
	barbershopName,
	referenceNumber,
	language = 'id'
}: {
	to: string
	customerName: string
	barbershopName: string
	referenceNumber: string
	language?: Language
}) {
	const year = new Date().getFullYear()
	const html = `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${t(language, 'email.bookingExpired.title')}</title>
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
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#a16207;text-transform:uppercase;letter-spacing:0.8px;">${t(language, 'email.bookingExpired.title')}</p>
              <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#18181b;line-height:1.3;">
                ${t(language, 'email.bookingExpired.heading', { customerName })}
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#52525b;line-height:1.6;">
                ${t(language, 'email.bookingExpired.body', { barbershopName })}
              </p>
              <table cellpadding="0" cellspacing="0" width="100%" style="background-color:#f9f9f9;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:13px;color:#52525b;">${t(language, 'email.bookingExpired.referenceLabel')}</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#18181b;letter-spacing:0.5px;">${referenceNumber}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:14px;color:#52525b;line-height:1.6;">
                ${t(language, 'email.bookingExpired.bodyExtra')}
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
                ${t(language, 'email.bookingExpired.footer', { to, year: String(year) })}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

	const text = t(language, 'email.bookingExpired.text', {
		customerName,
		barbershopName,
		referenceNumber
	})

	await sendEmail({
		to,
		subject: t(language, 'email.bookingExpired.subject', {
			barbershopName
		}),
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
