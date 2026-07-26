<x-mail::message>
# New contact form message

**From:** {{ $name }} ({{ $email }})

{{ $body }}

<x-mail::button :url="'mailto:'.$email">
Reply to {{ $name }}
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
