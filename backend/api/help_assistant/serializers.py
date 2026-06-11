from __future__ import annotations

from rest_framework import serializers


class HelpAssistantRequestSerializer(serializers.Serializer):
    query = serializers.CharField(allow_blank=False, max_length=2000, trim_whitespace=True)
    screen = serializers.CharField(required=False, allow_blank=True, max_length=128)
    route = serializers.CharField(required=False, allow_blank=True, max_length=128)
    locale = serializers.CharField(required=False, allow_blank=True, max_length=32)

    def validate_query(self, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("query is required")
        return cleaned
