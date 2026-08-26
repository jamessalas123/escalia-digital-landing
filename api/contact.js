export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY no está configurada en Vercel');
    return res.status(500).json({ error: 'Configuración del servidor incompleta' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Escalia Digital <formulario@escaliadigital.com>',
        to: ['contacto@escaliadigital.com'],
        reply_to: email,
        subject: `Nuevo mensaje de ${name} desde escaliadigital.com`,
        text: `Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Error de Resend:', errText);
      return res.status(502).json({ error: 'No se pudo enviar el mensaje' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error del formulario de contacto:', err);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}
