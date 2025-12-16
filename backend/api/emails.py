"""
Sistema de emails para notificaciones
"""
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from .models import Booking, UserProfile


def send_booking_confirmation_email(booking: Booking):
    """Enviar email de confirmación de reserva"""
    subject = f'✨ Confirmación de Reserva - {booking.get_service_name()}'
    
    context = {
        'booking': booking,
        'service_name': booking.get_service_name(),
        'client_name': booking.client_name,
        'scheduled_date': booking.scheduled_date,
        'amount': booking.amount_paid,
        'currency': booking.currency,
        'payment_method': booking.get_payment_method_display(),
    }
    
    # HTML email
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Arial', sans-serif; background-color: #0A0A1F; color: #ffffff; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ text-align: center; padding: 30px 0; }}
            .header h1 {{ color: #D4AF37; font-size: 32px; margin: 0; }}
            .content {{ background-color: #1a1a2e; border-radius: 12px; padding: 30px; margin: 20px 0; }}
            .detail-row {{ padding: 15px 0; border-bottom: 1px solid #333; }}
            .detail-label {{ color: #888; font-size: 14px; }}
            .detail-value {{ color: #fff; font-size: 16px; font-weight: bold; margin-top: 5px; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
            .button {{ display: inline-block; padding: 15px 30px; background-color: #D4AF37; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div style="font-size: 48px;">✨</div>
                <h1>Confirmación de Reserva</h1>
            </div>
            
            <div class="content">
                <p>Hola {context['client_name']},</p>
                <p>¡Gracias por confiar en nosotros! Tu reserva ha sido confirmada.</p>
                
                <div class="detail-row">
                    <div class="detail-label">Servicio</div>
                    <div class="detail-value">{context['service_name']}</div>
                </div>
                
                {'<div class="detail-row"><div class="detail-label">Fecha y Hora</div><div class="detail-value">' + str(context['scheduled_date']) + '</div></div>' if context['scheduled_date'] else ''}
                
                <div class="detail-row">
                    <div class="detail-label">Monto</div>
                    <div class="detail-value">{context['currency']} {context['amount']}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Método de Pago</div>
                    <div class="detail-value">{context['payment_method']}</div>
                </div>
                
                <p style="margin-top: 30px;">
                    Te contactaremos pronto con el link de la reunión y más detalles.
                </p>
                
                <p style="color: #D4AF37; font-weight: bold;">
                    🌟 Prepárate para esta experiencia transformadora
                </p>
            </div>
            
            <div class="footer">
                <p>Este es un email automático, por favor no respondas a este mensaje.</p>
                <p>Si tienes preguntas, contáctanos en info@tonyblanco.com</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Plain text version
    plain_message = f"""
    Confirmación de Reserva - {context['service_name']}
    
    Hola {context['client_name']},
    
    ¡Gracias por confiar en nosotros! Tu reserva ha sido confirmada.
    
    Servicio: {context['service_name']}
    {'Fecha y Hora: ' + str(context['scheduled_date']) if context['scheduled_date'] else ''}
    Monto: {context['currency']} {context['amount']}
    Método de Pago: {context['payment_method']}
    
    Te contactaremos pronto con el link de la reunión y más detalles.
    
    🌟 Prepárate para esta experiencia transformadora
    
    ---
    Este es un email automático, por favor no respondas a este mensaje.
    Si tienes preguntas, contáctanos en info@tonyblanco.com
    """
    
    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[booking.client_email]
        )
        email.attach_alternative(html_message, "text/html")
        email.send()
        return True
    except Exception as e:
        print(f"Error enviando email: {e}")
        return False


def send_booking_reminder_email(booking: Booking):
    """Enviar recordatorio 24h antes de la sesión"""
    subject = f'🌙 Recordatorio: Tu sesión es mañana - {booking.get_service_name()}'
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Arial', sans-serif; background-color: #0A0A1F; color: #ffffff; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ text-align: center; padding: 30px 0; }}
            .header h1 {{ color: #D4AF37; font-size: 32px; margin: 0; }}
            .content {{ background-color: #1a1a2e; border-radius: 12px; padding: 30px; margin: 20px 0; }}
            .highlight {{ background-color: #D4AF37; color: #000; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div style="font-size: 48px;">🌙</div>
                <h1>Recordatorio de Sesión</h1>
            </div>
            
            <div class="content">
                <p>Hola {booking.client_name},</p>
                <p>Este es un recordatorio de que tu sesión es <strong>mañana</strong>.</p>
                
                <div class="highlight">
                    <div style="font-size: 14px; margin-bottom: 5px;">Tu sesión:</div>
                    <div style="font-size: 20px; font-weight: bold;">{booking.get_service_name()}</div>
                    <div style="font-size: 16px; margin-top: 10px;">{booking.scheduled_date}</div>
                </div>
                
                {f'<p><strong>Link de reunión:</strong><br>{booking.meeting_link}</p>' if booking.meeting_link else '<p>Te enviaremos el link de la reunión pronto.</p>'}
                
                <p>Prepara un espacio tranquilo y cómodo para la sesión. 🕯️</p>
                
                <p style="margin-top: 30px;">
                    Si necesitas reprogramar o tienes alguna pregunta, contáctanos cuanto antes.
                </p>
            </div>
            
            <div class="footer">
                <p>Nos vemos pronto ✨</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    plain_message = f"""
    Recordatorio de Sesión
    
    Hola {booking.client_name},
    
    Este es un recordatorio de que tu sesión es mañana.
    
    Servicio: {booking.get_service_name()}
    Fecha y Hora: {booking.scheduled_date}
    {f'Link de reunión: {booking.meeting_link}' if booking.meeting_link else 'Te enviaremos el link de la reunión pronto.'}
    
    Prepara un espacio tranquilo y cómodo para la sesión. 🕯️
    
    Si necesitas reprogramar o tienes alguna pregunta, contáctanos cuanto antes.
    
    Nos vemos pronto ✨
    """
    
    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[booking.client_email]
        )
        email.attach_alternative(html_message, "text/html")
        email.send()
        return True
    except Exception as e:
        print(f"Error enviando email: {e}")
        return False


def send_meeting_link_email(booking: Booking):
    """Enviar link de reunión al cliente"""
    subject = f'🔗 Link de Reunión - {booking.get_service_name()}'
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Arial', sans-serif; background-color: #0A0A1F; color: #ffffff; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ text-align: center; padding: 30px 0; }}
            .content {{ background-color: #1a1a2e; border-radius: 12px; padding: 30px; margin: 20px 0; }}
            .link-box {{ background-color: #D4AF37; color: #000; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }}
            .link-box a {{ color: #000; text-decoration: none; font-size: 18px; font-weight: bold; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div style="font-size: 48px;">🔗</div>
                <h1 style="color: #D4AF37;">Link de tu Sesión</h1>
            </div>
            
            <div class="content">
                <p>Hola {booking.client_name},</p>
                <p>Aquí está el link para unirte a tu sesión:</p>
                
                <div class="link-box">
                    <a href="{booking.meeting_link}" target="_blank">UNIRSE A LA REUNIÓN</a>
                </div>
                
                <p><strong>Detalles de la sesión:</strong></p>
                <ul>
                    <li>Servicio: {booking.get_service_name()}</li>
                    <li>Fecha: {booking.scheduled_date}</li>
                    <li>Duración aproximada: Según el servicio contratado</li>
                </ul>
                
                <p style="margin-top: 30px;">
                    <strong>Recomendaciones:</strong>
                </p>
                <ul>
                    <li>Únete unos minutos antes de la hora programada</li>
                    <li>Asegúrate de tener buena conexión a internet</li>
                    <li>Busca un lugar tranquilo y cómodo</li>
                    <li>Ten agua cerca y algo para tomar notas si lo deseas</li>
                </ul>
                
                <p style="color: #D4AF37; font-weight: bold; margin-top: 30px;">
                    🌟 ¡Nos vemos pronto en este viaje del alma!
                </p>
            </div>
            
            <div class="footer">
                <p>Si tienes problemas técnicos, contáctanos inmediatamente.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    plain_message = f"""
    Link de tu Sesión
    
    Hola {booking.client_name},
    
    Aquí está el link para unirte a tu sesión:
    {booking.meeting_link}
    
    Detalles:
    - Servicio: {booking.get_service_name()}
    - Fecha: {booking.scheduled_date}
    
    Recomendaciones:
    - Únete unos minutos antes
    - Asegura buena conexión a internet
    - Busca un lugar tranquilo
    - Ten agua cerca
    
    🌟 ¡Nos vemos pronto en este viaje del alma!
    """
    
    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[booking.client_email]
        )
        email.attach_alternative(html_message, "text/html")
        email.send()
        return True
    except Exception as e:
        print(f"Error enviando email: {e}")
        return False


def send_welcome_email(user_profile: UserProfile):
    """Email de bienvenida para nuevos usuarios"""
    subject = '✨ Bienvenido a la Comunidad del Alma'
    
    user_type_message = (
        "Como terapeuta profesional, tienes acceso ilimitado a las herramientas de análisis kabbalístico."
        if user_profile.user_type == 'therapist'
        else f"Tienes {user_profile.max_fichas_per_month} fichas disponibles este mes para explorar tu mapa del alma."
    )
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Arial', sans-serif; background-color: #0A0A1F; color: #ffffff; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ text-align: center; padding: 30px 0; }}
            .header h1 {{ color: #D4AF37; font-size: 36px; margin: 0; }}
            .content {{ background-color: #1a1a2e; border-radius: 12px; padding: 30px; margin: 20px 0; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div style="font-size: 60px;">✨</div>
                <h1>¡Bienvenido/a!</h1>
            </div>
            
            <div class="content">
                <p>Hola {user_profile.full_name},</p>
                
                <p>Bienvenido/a a nuestra comunidad de Psicoterapia Kabbalística. Estamos emocionados de acompañarte en este viaje de autoconocimiento y transformación.</p>
                
                <p><strong>Tu cuenta está lista:</strong></p>
                <p>{user_type_message}</p>
                
                <p style="margin-top: 30px;"><strong>Próximos pasos:</strong></p>
                <ul>
                    <li>Explora nuestros servicios</li>
                    <li>Genera tu primer análisis kabbalístico</li>
                    <li>Únete a nuestra comunidad</li>
                    <li>Reserva tu primera sesión</li>
                </ul>
                
                <p style="color: #D4AF37; font-weight: bold; margin-top: 30px;">
                    🌟 El viaje del alma comienza ahora
                </p>
                
                <p>Con amor y luz,<br>Tony Blanco</p>
            </div>
            
            <div class="footer">
                <p>Si tienes preguntas, estamos aquí para ayudarte.</p>
                <p>info@tonyblanco.com</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    plain_message = f"""
    ¡Bienvenido/a!
    
    Hola {user_profile.full_name},
    
    Bienvenido/a a nuestra comunidad de Psicoterapia Kabbalística.
    
    {user_type_message}
    
    Próximos pasos:
    - Explora nuestros servicios
    - Genera tu primer análisis kabbalístico
    - Únete a nuestra comunidad
    - Reserva tu primera sesión
    
    🌟 El viaje del alma comienza ahora
    
    Con amor y luz,
    Tony Blanco
    """
    
    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user_profile.user.email]
        )
        email.attach_alternative(html_message, "text/html")
        email.send()
        return True
    except Exception as e:
        print(f"Error enviando email: {e}")
        return False


def send_password_reset_email(user, token: str, uid: str):
    """Enviar email de recuperación de contraseña"""
    from django.conf import settings
    from django.utils.http import urlsafe_base64_decode
    from django.utils.encoding import force_str
    
    subject = '🔐 Restablecer tu contraseña'
    
    # Construir URL de reset (el frontend debe tener una ruta /reset-password?token=...&uid=...)
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    reset_url = f"{frontend_url}/reset-password?token={token}&uid={uid}"
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Arial', sans-serif; background-color: #0A0A1F; color: #ffffff; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ text-align: center; padding: 30px 0; }}
            .header h1 {{ color: #D4AF37; font-size: 32px; margin: 0; }}
            .content {{ background-color: #1a1a2e; border-radius: 12px; padding: 30px; margin: 20px 0; }}
            .button {{ display: inline-block; padding: 15px 30px; background-color: #D4AF37; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div style="font-size: 48px;">🔐</div>
                <h1>Restablecer Contraseña</h1>
            </div>
            
            <div class="content">
                <p>Hola {user.username},</p>
                <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
                <p>Haz clic en el botón siguiente para crear una nueva contraseña:</p>
                <p style="text-align:center;"><a class="button" href="{reset_url}" target="_blank">Restablecer Contraseña</a></p>
                <p>O copia y pega este enlace en tu navegador:</p>
                <p style="word-break: break-all; color: #D4AF37;">{reset_url}</p>
                <p><strong>Este enlace expirará en 24 horas.</strong></p>
                <p>Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña permanecerá sin cambios.</p>
            </div>
            
            <div class="footer">
                <p>Este es un email automático, por favor no respondas a este mensaje.</p>
                <p>Si tienes preguntas, contáctanos en info@tonyblanco.com</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    plain_message = f"""
    Restablecer Contraseña
    
    Hola {user.username},
    
    Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
    
    Usa este enlace para crear una nueva contraseña:
    {reset_url}
    
    Este enlace expirará en 24 horas.
    
    Si no solicitaste este cambio, puedes ignorar este email.
    """
    
    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        email.attach_alternative(html_message, "text/html")
        email.send()
        return True
    except Exception as e:
        print(f"Error enviando email de reset: {e}")
        return False


def send_birthdata_unlock_email(user_profile: UserProfile, token: str):
    """Enviar link de desbloqueo para birth_data"""
    subject = '🔓 Solicitud: Desbloquear datos de nacimiento'
    # URL para confirmar (en producción sería la URL pública). Aquí sólo usamos token.
    unlock_url = f"http://localhost:3000/unlock-birth-data?token={token}&user={user_profile.user.id}"

    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Arial', sans-serif; background-color: #0A0A1F; color: #ffffff; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ text-align: center; padding: 30px 0; }}
            .header h1 {{ color: #D4AF37; font-size: 28px; margin: 0; }}
            .content {{ background-color: #1a1a2e; border-radius: 12px; padding: 30px; margin: 20px 0; }}
            .button {{ display: inline-block; padding: 12px 20px; background-color: #D4AF37; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div style="font-size: 48px;">🔓</div>
                <h1>Solicitud de desbloqueo de datos</h1>
            </div>
            <div class="content">
                <p>Hola {user_profile.full_name},</p>
                <p>Hemos recibido tu solicitud para desbloquear tus datos de nacimiento (nombre, fecha, hora, etc.).</p>
                <p>Para confirmar la solicitud, pulsa el botón abajo (o copia y pega la URL) y sigue las instrucciones.</p>
                <p style="text-align:center;"><a class="button" href="{unlock_url}" target="_blank">Confirmar desbloqueo</a></p>
                <p>Si no solicitaste este desbloqueo, puedes ignorar este email.</p>
                <p>Con gratitud,</p>
                <p><strong>Equipo - Análisis Cabalístico del Alma</strong></p>
            </div>
        </div>
    </body>
    </html>
    """

    plain_message = f"Solicitud de desbloqueo - {user_profile.full_name}\n\nConfirma con esta URL: {unlock_url}\n\nSi no solicitaste este desbloqueo, ignora este mensaje."
    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user_profile.user.email]
        )
        email.attach_alternative(html_message, "text/html")
        email.send()
        return True
    except Exception as e:
        print(f"Error enviando unlock email: {e}")
        return False
