<?php

namespace App\Services;

use App\Models\NotificationLog;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    public function dispatch(Mailable $mailable, $recipient): void
    {
        $userId  = $recipient->id;
        $type    = class_basename($mailable);

        $log = NotificationLog::create([
            'user_id' => $userId,
            'type'    => $type,
            'channel' => 'email',
            'status'  => 'queued',
        ]);

        try {
            Mail::to($recipient->email)->queue($mailable);

            $log->update(['status' => 'sent']);
        } catch (\Throwable $e) {
            $log->update([
                'status'        => 'failed',
                'error_message' => $e->getMessage(),
            ]);
        }
    }
}