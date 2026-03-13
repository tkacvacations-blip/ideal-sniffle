import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'test@example.com';

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'RESEND_API_KEY not configured',
          debug: {
            hasApiKey: false,
            adminEmail
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { email } = await req.json().catch(() => ({ email: adminEmail }));
    const testEmail = email || adminEmail;

    console.log('Attempting to send test email to:', testEmail);
    console.log('Using API key:', resendApiKey.substring(0, 10) + '...');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Test Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 40px; background-color: #f4f7fa;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 12px;">
            <h1 style="color: #2563eb; margin-bottom: 20px;">✓ Email System Test</h1>
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              This is a test email from TKAC Adventures booking system.
            </p>
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              If you received this email, your email notification system is working correctly!
            </p>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 30px;">
              Sent at: ${new Date().toLocaleString()}
            </p>
          </div>
        </body>
      </html>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'TKAC Adventures <onboarding@resend.dev>',
        to: [testEmail],
        subject: 'Test Email - TKAC Adventures',
        html: emailHtml,
      }),
    });

    const responseText = await resendResponse.text();
    console.log('Resend API response status:', resendResponse.status);
    console.log('Resend API response:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    if (!resendResponse.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to send email',
          status: resendResponse.status,
          details: responseData,
          debug: {
            apiKeyPrefix: resendApiKey.substring(0, 10),
            recipient: testEmail,
            sender: 'onboarding@resend.dev'
          }
        }),
        {
          status: resendResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Test email sent successfully to ${testEmail}`,
        emailId: responseData.id,
        recipient: testEmail,
        note: 'Check spam folder if not in inbox'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in test-email function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
