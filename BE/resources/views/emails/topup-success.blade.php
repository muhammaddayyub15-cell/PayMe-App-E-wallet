<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Top-Up Berhasil</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; }
        .header { background: #4F46E5; padding: 32px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
        .body { padding: 32px; color: #374151; }
        .body p { line-height: 1.6; margin: 0 0 16px; }
        .amount-box { background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }
        .amount-box .label { font-size: 13px; color: #6B7280; margin: 0 0 8px; }
        .amount-box .amount { font-size: 28px; font-weight: bold; color: #16A34A; margin: 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E5E7EB; font-size: 14px; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #6B7280; }
        .detail-value { color: #111827; font-weight: 500; }
        .footer { background: #F9FAFB; padding: 20px 32px; text-align: center; font-size: 12px; color: #9CA3AF; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <h1>PayMe</h1>
        </div>
        <div class="body">
            <p>Halo, <strong>{{ $recipientName }}</strong>.</p>
            <p>Top-up saldo PayMe kamu berhasil dilakukan.</p>

            <div class="amount-box">
                <p class="label">Jumlah Top-Up</p>
                <p class="amount">Rp {{ number_format($amount, 0, ',', '.') }}</p>
            </div>

            <div>
                <div class="detail-row">
                    <span class="detail-label">Saldo Setelah Top-Up</span>
                    <span class="detail-value">Rp {{ number_format($balanceAfter, 0, ',', '.') }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Waktu</span>
                    <span class="detail-value">{{ $transactedAt }}</span>
                </div>
            </div>

            <p style="margin-top: 24px;">Terima kasih telah menggunakan PayMe.</p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} PayMe. Email ini dikirim otomatis, mohon tidak membalas.
        </div>
    </div>
</body>
</html>