export const en = {
	email: {
		otp: {
			subject: '{purpose} verification code',
			text: 'Your verification code is {otp}. This code will expire shortly.'
		},
		invitation: {
			subject: '{inviterName} invited you to join {organizationName}',
			title: "You're invited",
			heading: 'Join {organizationName}',
			body: '<strong>{inviterName}</strong> has invited you to collaborate on <strong>{organizationName}</strong>. Accept your invite to get started.',
			cta: 'Accept Invitation',
			linkHint: 'Or copy this link into your browser:',
			footer: "This invitation was sent to <strong>{to}</strong>. If you weren't expecting this, you can safely ignore this email.<br/>&copy; {year} Cukkr. All rights reserved.",
			text: "You're invited to join {organizationName}\n\n{inviterName} has invited you to collaborate on {organizationName}.\n\nAccept your invitation: {inviteUrl}\n\nIf you weren't expecting this, you can safely ignore this email."
		},
		appointmentVerification: {
			subject: 'Confirm your appointment at {barbershopName}',
			title: 'Confirm Your Appointment',
			heading: 'Hi, {customerName}',
			body: 'Please confirm your appointment at <strong>{barbershopName}</strong> by clicking the button below. Your booking will only be processed after confirmation.',
			cta: 'Confirm Appointment',
			linkHint: 'Or copy this link into your browser:',
			footer: 'If you did not make this appointment, you can safely ignore this email.<br/>&copy; {year} Cukkr. All rights reserved.',
			text: 'Confirm Your Appointment\n\nHi {customerName},\n\nPlease confirm your appointment at {barbershopName} by visiting the link below. Your booking will only be processed after confirmation.\n\n{verifyUrl}\n\nIf you did not make this appointment, you can safely ignore this email.'
		},
		identityVerification: {
			subject: 'Verify your identity at {barbershopName}',
			title: 'Identity Verification',
			heading: 'Is this you, {customerName}?',
			body: 'Please confirm your identity for <strong>{barbershopName}</strong> by clicking the button below. This helps us keep your booking history connected to your account.',
			cta: 'Verify My Identity',
			linkHint: 'Or copy this link into your browser:',
			footer: 'If this was not you, you can safely ignore this email.<br/>&copy; {year} Cukkr. All rights reserved.',
			text: 'Verify Your Identity\n\nIs this you, {customerName}?\n\nPlease confirm your identity for {barbershopName} by visiting the link below. This helps us keep your booking history connected to your account.\n\n{verifyUrl}\n\nIf this was not you, you can safely ignore this email.'
		},
		bookingAccepted: {
			subject: 'Your appointment at {barbershopName} has been accepted',
			title: 'Booking Accepted',
			heading: 'Hi, {customerName}',
			body: 'Great news! Your appointment at <strong>{barbershopName}</strong> has been <strong>accepted</strong>.',
			referenceLabel: 'Reference Number',
			bodyExtra:
				'Please arrive on time for your appointment. If you need to make any changes, contact the barbershop directly.',
			footer: 'This email was sent to <strong>{to}</strong>.<br/>&copy; {year} Cukkr. All rights reserved.',
			text: 'Booking Accepted\n\nHi {customerName},\n\nGreat news! Your appointment at {barbershopName} has been accepted.\n\nReference Number: {referenceNumber}\n\nPlease arrive on time for your appointment. If you need to make any changes, contact the barbershop directly.'
		},
		bookingDeclined: {
			subject: 'Your appointment at {barbershopName} was declined',
			title: 'Booking Declined',
			heading: 'Hi, {customerName}',
			body: 'Unfortunately, your appointment at <strong>{barbershopName}</strong> was <strong>declined</strong>.',
			referenceLabel: 'Reference Number',
			reasonLabel: 'Reason',
			bodyExtra: 'You can book another appointment at a different time.',
			footer: 'This email was sent to <strong>{to}</strong>.<br/>&copy; {year} Cukkr. All rights reserved.',
			text: 'Booking Declined\n\nHi {customerName},\n\nUnfortunately, your appointment at {barbershopName} was declined.\n\nReference Number: {referenceNumber}{reasonText}\n\nYou can book another appointment at a different time.'
		},
		bookingExpired: {
			subject: 'Your appointment at {barbershopName} has expired',
			title: 'Booking Expired',
			heading: 'Hi, {customerName}',
			body: 'Your appointment at <strong>{barbershopName}</strong> has <strong>expired</strong> because it was not confirmed in time.',
			referenceLabel: 'Reference Number',
			bodyExtra:
				'If you still need an appointment, please book a new time.',
			footer: 'This email was sent to <strong>{to}</strong>.<br/>&copy; {year} Cukkr. All rights reserved.',
			text: 'Booking Expired\n\nHi {customerName},\n\nYour appointment at {barbershopName} has expired because it was not confirmed in time.\n\nReference Number: {referenceNumber}\n\nIf you still need an appointment, please book a new time.'
		}
	},
	notification: {
		appointmentRequested: {
			title: '{organizationName}',
			body: '{customerName} requested an appointment.'
		},
		walkInArrival: {
			title: '{organizationName}',
			body: '{customerName} has arrived as a walk-in customer.'
		},
		barbershopInvitation: {
			title: '{organizationName} Invitation',
			body: '{inviterName} invited you to join {organizationName}'
		}
	}
}
