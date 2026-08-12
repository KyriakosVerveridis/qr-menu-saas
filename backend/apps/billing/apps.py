from django.apps import AppConfig


class BillingConfig(AppConfig):
    name = 'apps.billing'

    def ready(self):
        import apps.billing.models  # ενεργοποιεί το post_save signal