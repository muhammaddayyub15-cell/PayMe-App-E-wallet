<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Kode OTP Transfer</title>
</head>
<body style="font-family: sans-serif; background: #f4f4f4; padding: 32px;">
    <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px;">
        <h2 style="color: #1a1a2e; margin-bottom: 8px;">Kode OTP Transfer</h2>
        <p style="color: #555;">Halo, <strong>{{ $user->name }}</strong>.</p>
        <p style="color: #555;">Gunakan kode berikut untuk mengkonfirmasi transfer kamu:</p>

        <div style="text-align: center; margin: 32px 0;">
            <span style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #6c63ff;">
                {{ $code }}
            </span>
        </div>

        <p style="color: #888; font-size: 13px;">Kode berlaku selama <strong>5 menit</strong>.</p>
        <p style="color: #888; font-size: 13px;">Jika kamu tidak merasa melakukan transfer, abaikan email ini.</p>

        <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #bbb; font-size: 11px; text-align: center;">PayMe &mdash; Dompet Digital Aman</p>
    </div>
</body>
</html>