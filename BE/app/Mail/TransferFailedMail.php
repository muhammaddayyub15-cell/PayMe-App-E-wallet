<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TransferFailedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $senderName,
        public readonly int    $amount,
        public readonly string $reason,
        public readonly string $transactedAt,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Transfer Gagal — PayMe',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.transfer-failed',
            with: [
                'senderName'   => $this->senderName,
                'amount'       => $this->amount,
                'reason'       => $this->reason,
                'transactedAt' => $this->transactedAt,
            ],
        );
    }
}