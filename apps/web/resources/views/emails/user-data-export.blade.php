<x-mail::message>
# Your data export

Hi {{ $name }},

Attached is a JSON copy of your Equalsite account data — your account
details and your audit history, including violation summaries.

If you didn't request this, you can safely ignore this email.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
